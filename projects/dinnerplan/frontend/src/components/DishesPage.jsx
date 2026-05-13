import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../data/api';

const categories = [
  { value: 'appetizer', label: '🥗 מנת פתיחה' },
  { value: 'main', label: '🥘 מנת עיקרית' },
  { value: 'salad', label: '🥬 סלט' },
  { value: 'dessert', label: '🍰 קינוח' },
  { value: 'drink', label: '🥤 משקה' },
  { value: 'bread', label: '🍞 לחם' },
  { value: 'other', label: '🍽️ אחר' }
];

const DishesPage = ({ dishes, setDishes, families, dinnerId }) => {
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [form, setForm] = useState({ name: '', category: 'main', familyId: '', dinnerId: dinnerId || '', ingredientList: '' });

  useEffect(() => {
    setForm(f => ({ ...f, dinnerId: dinnerId || '' }));
  }, [dinnerId]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const dish = await api.createDish(form);
    setDishes([...dishes, dish]);
    setShowModal(false);
    setForm({ name: '', category: 'main', familyId: '', dinnerId: dinnerId || '', ingredientList: '' });
  };

  const handleDelete = async (id) => {
    await api.deleteDish(id);
    setDishes(dishes.filter(d => d.id !== id));
  };

  const filteredDishes = dishes.filter(d => {
    if (filterCategory !== 'all' && d.category !== filterCategory) return false;
    return true;
  });

  const getFamilyName = (familyId) => {
    const family = families.find(f => f.id === familyId);
    return family ? family.name : 'לא יועד';
  };

  const getCategoryLabel = (cat) => {
    const found = categories.find(c => c.value === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>🥘 מנות</h1>
          {dinnerId && (
            <p>ניהול מנות לארוחה ספציפית</p>
          )}
          {!dinnerId && (
            <p>תכנן מה כל משפחה מכינה</p>
          )}
          {dinnerId && (
            <Link to="/dinners" className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>← חזרה לארוחות</Link>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + הוסף מנה
        </button>
      </div>

      {/* Filter by category */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterCategory('all')}
        >
          הכל
        </button>
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`btn btn-sm ${filterCategory === cat.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredDishes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🥘</div>
          <h3>אין מנות עדיין</h3>
          <p>הוסף מנות כדי לתכנן מה כל אחד מכין</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredDishes.map(dish => (
            <div key={dish.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 18, marginBottom: 8 }}>{dish.name}</h3>
                  <span className="badge badge-primary">{getCategoryLabel(dish.category)}</span>
                  <p style={{ marginTop: 8 }}>
                    <span className="badge badge-secondary">👨‍👩‍👧‍👦 {getFamilyName(dish.familyId)}</span>
                  </p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dish.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>הוסף מנה</h2>
            <div className="form-group">
              <label>שם המנה</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="למשל: חומץ, סלט ירוק, ערביה"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>קטגוריה</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>מי מכין?</label>
              <select
                value={form.familyId}
                onChange={e => setForm({ ...form, familyId: e.target.value })}
              >
                <option value="">לא יועד</option>
                {families.map(family => (
                  <option key={family.id} value={family.id}>{family.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>מצרכים (מפוסקים בפסיקים)</label>
              <textarea
                value={form.ingredientList}
                onChange={e => setForm({ ...form, ingredientList: e.target.value })}
                placeholder="למשל: עגבניות, מלפפונים, שמן זית, לימון"
                rows="3"
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

export default DishesPage;
