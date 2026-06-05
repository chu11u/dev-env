"""Event Correlator - Main FastAPI Application."""
import sys
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.collectors.frigate import FrigateCollector
from app.collectors.ha_collector import HACollector
from app.collectors.docker_collector import DockerCollector
from app.collectors.system import SystemCollector
from app.database import (
    store_events_batch, search_events, get_events,
    get_event_count, cleanup_old_events,
)
from app.models import Event

# ── Collectors ──
frigate_collector = FrigateCollector()
ha_collector = HACollector()
docker_collector = DockerCollector()
system_collector = SystemCollector()

collectors = {
    "frigate": frigate_collector,
    "ha": ha_collector,
    "docker": docker_collector,
    "system": system_collector,
}

# ── Background collection state ──
_last_collection = {
    "frigate": None,
    "ha": None,
    "docker": None,
    "system": None,
}
_is_collecting = False
_collect_count = 0


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: run initial collection on startup."""
    print("Event Correlator starting up...", file=sys.stderr)
    print(f"Qdrant: {os.environ.get('QDRANT_HOST', '192.168.131.50')}:6333", file=sys.stderr)
    print(f"Embed API: {os.environ.get('EMBED_API_URL', 'http://192.168.131.50:8001')}", file=sys.stderr)
    # Run initial collection in background
    import asyncio
    async def _initial_collect():
        try:
            await collect_all()
        except Exception as e:
            print(f"Initial collection error: {e}", file=sys.stderr)
    asyncio.create_task(_initial_collect())
    yield
    print("Event Correlator shutting down...", file=sys.stderr)


app = FastAPI(
    title="HomeLab Event Correlator",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Mount static frontend ──
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


# ── Helper ──
async def collect_source(source: str) -> list[Event]:
    """Collect events from a single source."""
    collector = collectors.get(source)
    if not collector:
        return []
    try:
        events = await collector.collect()
        if events:
            stored = await store_events_batch(events)
            print(f"Collected {len(events)} events from {source} (stored: {stored})", file=sys.stderr)
        return events
    except Exception as e:
        print(f"Error collecting from {source}: {e}", file=sys.stderr)
        return []


async def collect_all() -> dict[str, int]:
    """Collect events from all sources."""
    global _is_collecting, _collect_count
    if _is_collecting:
        return {"status": "already_collecting"}
    
    _is_collecting = True
    counts = {}
    try:
        for source in ["frigate", "ha", "docker", "system"]:
            events = await collect_source(source)
            counts[source] = len(events)
            if events:
                _last_collection[source] = datetime.utcnow()
        _collect_count += 1
        
        # Occasional cleanup
        if _collect_count % 10 == 0:
            await cleanup_old_events()
    finally:
        _is_collecting = False
    
    return counts


# ── API Routes ──

@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "uptime": "running",
        "total_collections": _collect_count,
        "is_collecting": _is_collecting,
        "last_collection": {k: v.isoformat() if v else None for k, v in _last_collection.items()},
    }


@app.get("/api/stats")
async def stats():
    """Get event statistics."""
    counts = get_event_count()
    return counts


@app.get("/api/events")
async def list_events(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    source: Optional[str] = None,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    host: Optional[str] = None,
    since: Optional[str] = None,
    until: Optional[str] = None,
):
    """List events with optional filters."""
    events = get_events(
        limit=limit,
        offset=offset,
        source=source,
        severity=severity,
        event_type=event_type,
        host=host,
        since=since,
        until=until,
    )
    # Get total count for pagination
    counts = get_event_count()
    total = counts.get("total", 0)
    
    return {
        "events": [e.model_dump(mode="json") for e in events],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@app.get("/api/events/search")
async def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    source: Optional[str] = None,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    host: Optional[str] = None,
):
    """Semantic search over events."""
    if not q.strip():
        raise HTTPException(400, "Query parameter 'q' is required")
    
    events = await search_events(
        query=q.strip(),
        limit=limit,
        source=source,
        severity=severity,
        event_type=event_type,
        host=host,
    )
    return {
        "query": q,
        "results": [e.model_dump(mode="json") for e in events],
        "count": len(events),
    }


@app.post("/api/collect")
async def trigger_collection(source: Optional[str] = Query(None)):
    """Trigger event collection for all sources or a specific one."""
    if source:
        if source not in collectors:
            raise HTTPException(400, f"Unknown source: {source}. Available: {list(collectors.keys())}")
        events = await collect_source(source)
        return {"source": source, "collected": len(events)}
    else:
        counts = await collect_all()
        return {"collected": counts}


@app.get("/api/sources")
async def list_sources():
    """List available data sources and their status."""
    return {
        "sources": [
            {
                "name": "frigate",
                "label": "Frigate NVR",
                "description": "Camera motion and object detection events",
                "enabled": True,
                "last_collection": _last_collection["frigate"].isoformat() if _last_collection["frigate"] else None,
            },
            {
                "name": "ha",
                "label": "Home Assistant",
                "description": "Smart home state changes and automations",
                "enabled": True,
                "last_collection": _last_collection["ha"].isoformat() if _last_collection["ha"] else None,
            },
            {
                "name": "docker",
                "label": "Docker",
                "description": "Container status changes on monitored hosts",
                "enabled": True,
                "last_collection": _last_collection["docker"].isoformat() if _last_collection["docker"] else None,
            },
            {
                "name": "system",
                "label": "System Monitor",
                "description": "Disk usage, uptime, and system health metrics",
                "enabled": True,
                "last_collection": _last_collection["system"].isoformat() if _last_collection["system"] else None,
            },
        ]
    }


@app.get("/api/dashboard")
async def dashboard():
    """Get dashboard summary data."""
    stats_data = get_event_count()
    recent_events = get_events(limit=10)
    
    now = datetime.utcnow()
    hour_ago = now - timedelta(hours=1)
    day_ago = now - timedelta(hours=24)
    
    return {
        "stats": stats_data,
        "recent_events": [e.model_dump(mode="json") for e in recent_events],
        "sources_status": {
            "frigate": {"last_collection": _last_collection["frigate"].isoformat() if _last_collection["frigate"] else None},
            "ha": {"last_collection": _last_collection["ha"].isoformat() if _last_collection["ha"] else None},
            "docker": {"last_collection": _last_collection["docker"].isoformat() if _last_collection["docker"] else None},
            "system": {"last_collection": _last_collection["system"].isoformat() if _last_collection["system"] else None},
        },
        "collect_count": _collect_count,
    }


# ── Serve frontend ──
@app.get("/")
async def serve_frontend():
    """Serve the main frontend HTML."""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Event Correlator API", "docs": "/docs"}
