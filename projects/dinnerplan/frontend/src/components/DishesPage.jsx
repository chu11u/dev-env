import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../data/api";

const categories = [
  { value: "appetizer", label: "🥗 מנת פתיחה" },
  { value: "main", label: "🥘 מנת עיקרית" },
  { value: "salad", label: "🥬 סלט" },
  { value: "dessert", label: "🍰 קינוח" },
  { value: "drink", label: "🥤 משקה" },
  { value: "bread", label: "🍞 לחם" },
  { value: "other", label: "🍽️ אחר" },
];

const DishesPage = ({ dishes, setDishes, families, dinnerId }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState({
    name: "",
    category: "main",
    familyId: "",
    dinnerId: dinnerId || "",
    ingredientList: "",
  });

  useEffect(() => {
    setForm((f) => ({ ...f, dinnerId: dinnerId || "" }));
  }, [dinnerId]);

  // Get unique dish names (one per unique name, for template reuse)
  const uniqueDishNames = dishes.reduce((acc, dish) => {
    if (!acc.find((d) => d.name === dish.name)) {
      acc.push(dish);
    }
    return acc;
  }, []);

  // Duplicate an existing dish as a new entry for current dinner
  const handleDuplicateDish = (dish) => {
    setForm({
      name: dish.name,
      category: dish.category,
      familyId: "",
      dinnerId: dinnerId || "",
      ingredientList: dish.ingredientList || "",
    });
    setShowTemplates(false);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const dish = await api.createDish(form);
    setDishes([...dishes, dish]);
    setShowModal(false);
    setEditingDish(null);
    setForm({
      name: "",
      category: "main",
      familyId: "",
      dinnerId: dinnerId || "",
      ingredientList: "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDish || !form.name.trim()) return;
    const updated = await api.updateDish(editingDish.id, form);
    setDishes(dishes.map((d) => (d.id === editingDish.id ? updated : d)));
    setShowModal(false);
    setEditingDish(null);
    setForm({
      name: "",
      category: "main",
      familyId: "",
      dinnerId: dinnerId || "",
      ingredientList: "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מנה זו?")) return;
    await api.deleteDish(id);
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const openEdit = (dish) => {
    setEditingDish(dish);
    setForm({
      name: dish.name || "",
      category: dish.category || "main",
      familyId: dish.familyId || "",
      dinnerId: dish.dinnerId || dinnerId || "",
      ingredientList: dish.ingredientList || "",
    });
    setShowModal(true);
  };

  const filteredDishes = dishes.filter((d) => {
    if (filterCategory !== "all" && d.category !== filterCategory) return false;
    return true;
  });

  const getFamilyName = (familyId) => {
    const family = families.find((f) => f.id === familyId);
    return family ? family.name : "לא יועד";
  };

  const getCategoryLabel = (cat) => {
    const found = categories.find((c) => c.value === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="container">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1>🥘 מנות</h1>
          {dinnerId && <p>ניהול מנות לארוחה ספציפית</p>}
          {!dinnerId && <p>תכנן מה כל משפחה מכינה</p>}
          {dinnerId && (
            <Link
              to="/dinners"
              className="btn btn-outline btn-sm"
              style={{ marginTop: 8 }}
            >
              ← חזרה לארוחות
            </Link>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + הוסף מנה
        </button>
      </div>

      {/* Filter by category */}
      <div
        style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <button
          className={`btn btn-sm ${filterCategory === "all" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterCategory("all")}
        >
          הכל
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`btn btn-sm ${filterCategory === cat.value ? "btn-primary" : "btn-outline"}`}
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
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={{ fontSize: 18, marginBottom: 8 }}>{dish.name}</h3>
                  <span className="badge badge-primary">
                    {getCategoryLabel(dish.category)}
                  </span>
                  <p style={{ marginTop: 8 }}>
                    <span className="badge badge-secondary">
                      👨‍👩‍👧‍👦 {getFamilyName(dish.familyId)}
                    </span>
                  </p>
                  {dish.ingredientList && (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "var(--color-text-light)",
                      }}
                    >
                      🥦 {dish.ingredientList}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openEdit(dish)}
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(dish.id)}
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
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            setEditingDish(null);
            setShowTemplates(false);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>
              {editingDish ? "עריכת מנה" : "הוסף מנה"}
            </h2>

            {/* Existing dishes to reuse - only show when adding (not editing) and we have templates */}
            {!editingDish && uniqueDishNames.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                  style={{ marginBottom: 8 }}
                >
                  {showTemplates
                    ? "🍽️ הסתר מנות קיימות"
                    : `🍽️ השתמש במנה קיימת (${uniqueDishNames.length})`}
                </button>

                {showTemplates && (
                  <div className="grid-2" style={{ gap: 8 }}>
                    {uniqueDishNames.map((dish) => (
                      <div
                        key={dish.id}
                        onClick={() => handleDuplicateDish(dish)}
                        style={{
                          padding: 12,
                          border: "2px solid var(--color-border)",
                          borderRadius: 12,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          background: "var(--color-surface)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--color-primary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--color-border)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <strong style={{ fontSize: 14 }}>{dish.name}</strong>
                          <span
                            className="badge badge-primary"
                            style={{ fontSize: 11 }}
                          >
                            {getCategoryLabel(dish.category)}
                          </span>
                        </div>
                        {dish.ingredientList && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-light)",
                              marginTop: 4,
                            }}
                          >
                            🥦 {dish.ingredientList}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-light)",
                            marginTop: 4,
                          }}
                        >
                          👨‍👩‍👧‍👦 {getFamilyName(dish.familyId)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>שם המנה</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="למשל: חומץ, סלט ירוק, ערביה"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>קטגוריה</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>מי מכין?</label>
              <select
                value={form.familyId}
                onChange={(e) => setForm({ ...form, familyId: e.target.value })}
              >
                <option value="">לא יועד</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>מצרכים (מפוסקים בפסיקים)</label>
              <textarea
                value={form.ingredientList}
                onChange={(e) =>
                  setForm({ ...form, ingredientList: e.target.value })
                }
                placeholder="למשל: עגבניות, מלפפונים, שמן זית, לימון"
                rows="3"
              />
            </div>
            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingDish(null);
                  setShowTemplates(false);
                }}
              >
                ביטול
              </button>
              <button
                className="btn btn-primary"
                onClick={editingDish ? handleSaveEdit : handleAdd}
              >
                {editingDish ? "שמור" : "הוסף"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishesPage;
