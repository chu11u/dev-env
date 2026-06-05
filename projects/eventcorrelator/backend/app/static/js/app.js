/* ── Event Correlator Frontend ── */

const API_BASE = '/api';
let tlOffset = 0;
let tlLimit = 50;
let autoRefresh = null;

// ── Navigation ──
function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    if (view === 'dashboard') loadDashboard();
    if (view === 'timeline') { tlOffset = 0; loadTimeline(); }
    if (view === 'sources') loadSources();
}

// ── API Helper ──
async function api(path, opts = {}) {
    try {
        const resp = await fetch(`${API_BASE}${path}`, {
            headers: { 'Accept': 'application/json', ...opts.headers },
            ...opts,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
    } catch (e) {
        console.error(`API error: ${e}`);
        updateStatus(false);
        return null;
    }
}

// ── Status ──
function updateStatus(connected) {
    const badge = document.getElementById('statusBadge');
    if (connected === false) {
        badge.innerHTML = '<span class="dot dot-red"></span> Disconnected';
    } else {
        badge.innerHTML = '<span class="dot dot-green"></span> Connected';
    }
}

// ── Formatting ──
function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── Render Event Item ──
function renderEvent(event) {
    const sev = event.severity || 'info';
    const tags = (event.tags || []).slice(0, 5);
    return `
        <div class="event-item severity-${sev}">
            <div class="event-header">
                <div class="event-title">${escapeHtml(event.title)}</div>
                <div class="event-meta">
                    <span class="source-badge source-${event.source}">${event.source}</span>
                    <span class="severity-badge severity-${sev}">${sev}</span>
                    <span class="event-time">${formatTime(event.timestamp)}</span>
                </div>
            </div>
            ${event.description ? `<div class="event-desc">${escapeHtml(event.description)}</div>` : ''}
            ${tags.length ? `<div class="event-tags">${tags.map(t => `<span class="event-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
    `;
}

function renderSearchResult(event, score) {
    const sev = event.severity || 'info';
    return `
        <div class="search-result-item">
            <div class="event-header">
                <div class="result-title">${escapeHtml(event.title)}</div>
                <div class="event-meta">
                    <span class="severity-badge severity-${sev}">${sev}</span>
                    <span class="event-time">${formatTime(event.timestamp)}</span>
                    <span class="result-score">${(score * 100).toFixed(1)}%</span>
                </div>
            </div>
            ${event.description ? `<div class="result-desc">${escapeHtml(event.description)}</div>` : ''}
        </div>
    `;
}

// ── Dashboard ──
async function loadDashboard() {
    const data = await api('/dashboard');
    if (!data) return;

    // Stats
    const stats = data.stats || {};
    document.getElementById('statTotal').textContent = stats.total || 0;
    document.getElementById('statFrigate').textContent = (stats.by_source && stats.by_source.frigate) || 0;
    document.getElementById('statHA').textContent = (stats.by_source && stats.by_source.ha) || 0;
    document.getElementById('statDocker').textContent = (stats.by_source && stats.by_source.docker) || 0;
    document.getElementById('statSystem').textContent = (stats.by_source && stats.by_source.system) || 0;
    document.getElementById('statInfo').textContent = (stats.by_severity && stats.by_severity.info) || 0;
    document.getElementById('statWarning').textContent = (stats.by_severity && stats.by_severity.warning) || 0;
    document.getElementById('statError').textContent = ((stats.by_severity && stats.by_severity.error || 0) + (stats.by_severity && stats.by_severity.critical || 0));

    // Recent events
    const events = data.recent_events || [];
    document.getElementById('recentCount').textContent = events.length;
    const container = document.getElementById('recentEvents');
    if (events.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="emoji">📭</div><p>No events yet. Events will appear here once collectors run.</p></div>';
    } else {
        container.innerHTML = events.map(renderEvent).join('');
    }

    updateStatus(true);
}

// ── Timeline ──
async function loadTimeline() {
    const source = document.getElementById('tlSource').value;
    const severity = document.getElementById('tlSeverity').value;
    tlLimit = parseInt(document.getElementById('tlLimit').value);
    tlOffset = 0;

    let path = `/events?limit=${tlLimit}&offset=0`;
    if (source) path += `&source=${source}`;
    if (severity) path += `&severity=${severity}`;

    const data = await api(path);
    if (!data) return;

    const events = data.events || [];
    const container = document.getElementById('timelineEvents');
    if (events.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="emoji">📭</div><p>No events matched your filters.</p></div>';
    } else {
        container.innerHTML = events.map(renderEvent).join('');
    }
    document.getElementById('loadMoreBtn').style.display = events.length >= tlLimit ? 'block' : 'none';
}

async function loadMore() {
    tlOffset += tlLimit;
    const source = document.getElementById('tlSource').value;
    const severity = document.getElementById('tlSeverity').value;

    let path = `/events?limit=${tlLimit}&offset=${tlOffset}`;
    if (source) path += `&source=${source}`;
    if (severity) path += `&severity=${severity}`;

    const data = await api(path);
    if (!data) return;

    const events = data.events || [];
    const container = document.getElementById('timelineEvents');
    container.innerHTML += events.map(renderEvent).join('');
    document.getElementById('loadMoreBtn').style.display = events.length >= tlLimit ? 'block' : 'none';
}

// ── Search ──
async function doSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    const source = document.getElementById('searchSource').value;
    const severity = document.getElementById('searchSeverity').value;

    let path = `/events/search?q=${encodeURIComponent(query)}&limit=30`;
    if (source) path += `&source=${source}`;
    if (severity) path += `&severity=${severity}`;

    document.getElementById('searchHint').style.display = 'none';
    document.getElementById('searchResults').innerHTML = '<div class="empty-state">Searching...</div>';

    const data = await api(path);
    if (!data) {
        document.getElementById('searchResults').innerHTML = '<div class="empty-state">Search failed. Is the backend connected?</div>';
        return;
    }

    const results = data.results || [];
    if (results.length === 0) {
        document.getElementById('searchResults').innerHTML = '<div class="empty-state"><div class="emoji">🔍</div><p>No results found for your query.</p></div>';
    } else {
        // We don't have individual scores from the API, so estimate from result order
        document.getElementById('searchResults').innerHTML = results.map((e, i) => {
            const score = Math.max(0, 1 - (i / results.length) * 0.5);
            return renderSearchResult(e, score);
        }).join('');
    }
}

// ── Sources ──
async function loadSources() {
    const data = await api('/sources');
    if (!data) return;

    const sources = data.sources || [];
    const grid = document.getElementById('sourcesGrid');
    grid.innerHTML = sources.map(s => `
        <div class="source-card">
            <div class="source-name">${s.label}</div>
            <div class="source-desc">${s.description}</div>
            <div class="source-status">
                <span class="dot ${s.last_collection ? 'dot-green' : 'dot-yellow'}"></span>
                ${s.enabled ? 'Enabled' : 'Disabled'}
                ${s.last_collection ? `· Last: ${formatTime(s.last_collection)}` : '· Never collected'}
            </div>
            <div class="source-actions">
                <button class="btn btn-sm" onclick="triggerCollectSource('${s.name}')">Collect Now</button>
            </div>
        </div>
    `).join('');
}

async function triggerCollect() {
    const btn = document.querySelector('.collect-actions .btn-primary');
    const status = document.getElementById('collectStatus');
    btn.disabled = true;
    status.textContent = 'Collecting...';
    
    const data = await api('/collect', { method: 'POST' });
    if (data && data.collected) {
        const counts = Object.entries(data.collected).filter(([_, v]) => v > 0);
        status.textContent = counts.map(([k, v]) => `${k}: ${v}`).join(', ') || 'Nothing new';
        loadDashboard();
        loadSources();
    } else {
        status.textContent = 'Collection completed';
    }
    btn.disabled = false;
    setTimeout(() => { status.textContent = ''; }, 5000);
}

async function triggerCollectSource(source) {
    const data = await api(`/collect?source=${source}`, { method: 'POST' });
    if (data) {
        loadSources();
        loadDashboard();
    }
}

// ── Auto-refresh ──
function startAutoRefresh() {
    if (autoRefresh) clearInterval(autoRefresh);
    autoRefresh = setInterval(() => {
        const active = document.querySelector('.view.active');
        if (active && active.id === 'view-dashboard') loadDashboard();
        if (active && active.id === 'view-timeline') loadTimeline();
    }, 15000); // Every 15 seconds
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    loadSources();
    startAutoRefresh();
});
