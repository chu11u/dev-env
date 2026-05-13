import React, { useState } from 'react';
import { api } from '../data/api';

const avatarColors = ['#E8734A', '#6B8F71', '#F4B942', '#7B9ED7', '#C45A35', '#4A6B4F', '#96730A', '#D94F4F'];

const FamiliesPage = ({ families, setFamilies }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', members: '' });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const members = form.members.split(',').map(m => m.trim()).filter(Boolean);
    const family = await api.createFamily({ name: form.name, members });
    setFamilies([...families, family]);
    setShowModal(false);
    setForm({ name: '', members: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משפחה זו?')) return;
    await api.deleteFamily(id);
    setFamilies(families.filter(f => f.id !== id));
  };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>👨‍👩‍👧‍👦 משפחות</h1>
          <p>נהל את המשפחות שמשתתפות בארוחות</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + הוסף משפחה
        </button>
      </div>

      {families.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👨‍👩‍👧‍👦</div>
          <h3>אין משפחות עדיין</h3>
          <p>התחל בהוספת משפחות כדי לתכנן ארוחות</p>
        </div>
      ) : (
        <div className="grid-2">
          {families.map((family, idx) => (
            <div key={family.id} className="card">
              <div className="family-card">
                <div className="family-avatar" style={{ background: avatarColors[idx % avatarColors.length] }}>
                  {family.name.charAt(0).toUpperCase()}
                </div>
                <div className="family-info">
                  <h3>{family.name}</h3>
                  {family.members && family.members.length > 0 && (
                    <p>{family.members.join(', ')}</p>
                  )}
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(family.id)}
                  style={{ flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>הוסף משפחה</h2>
            <div className="form-group">
              <label>שם המשפחה</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="למשל: המשפחה של רותי"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>חברים (מפוסקים בפסיקים)</label>
              <input
                type="text"
                value={form.members}
                onChange={e => setForm({ ...form, members: e.target.value })}
                placeholder="למשל: רותי, יונתן, דניאל, נועה"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>ביטול</button>
              <button className="btn btn-primary" onClick={handleAdd}>הוסף</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamiliesPage;
