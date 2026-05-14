import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../data/api";

const DinnersPage = ({ dinners, setDinners, families, refreshData }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "19:00",
    location: "",
    notes: "",
    guestFamilyIds: "",
  });

  const handleAdd = async () => {
    if (!form.date) return;
    const guestList = form.guestFamilyIds
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
      .map((fid) => ({ familyId: fid, attendees: 0 }));
    const dinner = await api.createDinner({ ...form, guestList });
    setDinners([...dinners, dinner]);
    setShowModal(false);
    setForm({
      name: "",
      date: "",
      time: "19:00",
      location: "",
      notes: "",
      guestFamilyIds: "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק ארוחה זו?")) return;
    await api.deleteDinner(id);
    setDinners(dinners.filter((d) => d.id !== id));
  };

  const sortedDinners = [...dinners].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "ללא תאריך";
    const d = new Date(dateStr);
    return d.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isPast = (dateStr) =>
    dateStr && new Date(dateStr) < new Date(new Date().toDateString());

  return (
    <div className="container">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>🍽️ ארוחות</h1>
          <p>תכנן ארוחות משפחתיות - תאריכים, מיקומים ומנות</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + הוסף ארוחה
        </button>
      </div>

      {dinners.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🍽️</div>
          <h3>אין ארוחות מתוכננות</h3>
          <p>הוסף ארוחה ראשונה כדי להתחיל לתכנן</p>
        </div>
      ) : (
        <div>
          {sortedDinners.map((dinner) => (
            <div
              key={dinner.id}
              className="card"
              style={{ opacity: isPast(dinner.date) ? 0.6 : 1 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 8 }}>
                    {dinner.name || "ארוחה"}
                    {isPast(dinner.date) && (
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--color-text-light)",
                          marginRight: 8,
                        }}
                      >
                        (חלפה)
                      </span>
                    )}
                  </h2>
                  <p style={{ marginBottom: 4 }}>
                    <span className="badge badge-primary">
                      {formatDate(dinner.date)}
                    </span>
                    {dinner.time && (
                      <span
                        className="badge badge-accent"
                        style={{ marginRight: 8 }}
                      >
                        🕐 {dinner.time}
                      </span>
                    )}
                    {dinner.location && (
                      <span
                        className="badge badge-secondary"
                        style={{ marginRight: 8 }}
                      >
                        📍 {dinner.location}
                      </span>
                    )}
                  </p>
                  {dinner.guestList && dinner.guestList.length > 0 && (
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                      🍴{" "}
                      {dinner.guestList.reduce(
                        (sum, g) => sum + (g.attendees || 0),
                        0,
                      )}{" "}
                      אנשים מתוכננים
                    </p>
                  )}
                  {dinner.notes && (
                    <p
                      style={{ marginTop: 8, color: "var(--color-text-light)" }}
                    >
                      {dinner.notes}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Link
                    to={`/dinner/${dinner.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    📋 סיכום
                  </Link>
                  <Link
                    to={`/dishes/${dinner.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    🥘 מנות
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(dinner.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>הוסף ארוחה</h2>
            <div className="form-group">
              <label>שם הארוחה</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="למשל: ארוחת שבת, יום הולדת"
              />
            </div>
            <div className="form-group">
              <label>תאריך</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>שעה</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>מיקום</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="למשל: אצל רותי, בגן הציבורי"
              />
            </div>
            <div className="form-group">
              <label>משפחות מוזמנות (מפוסקות בפסיקים, לפי שם)</label>
              <input
                type="text"
                value={form.guestFamilyIds}
                onChange={(e) =>
                  setForm({ ...form, guestFamilyIds: e.target.value })
                }
                placeholder="למשל: המשפחה של רותי, המשפחה של יובל"
              />
              {families.length > 0 && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-light)",
                    marginTop: 4,
                  }}
                >
                  משפחות קיימות: {families.map((f) => f.name).join(", ")}
                </p>
              )}
            </div>
            <div className="form-group">
              <label>הערות</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="הערות כלליות על הארוחה"
                rows="3"
              />
            </div>
            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                ביטול
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                הוסף
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DinnersPage;
