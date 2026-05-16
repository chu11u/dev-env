import React, { useState } from "react";
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

const DishesPage = ({
  dishes,
  setDishes,
  families,
  dinnerDishes,
  setDinnerDishes,
  dinners,
  dinnerId,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState({
    name: "",
    category: "main",
    ingredientList: "",
  });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const dish = await api.createDish(form);
    setDishes([...dishes, dish]);
    setShowModal(false);
    setEditingDish(null);
    setForm({ name: "", category: "main", ingredientList: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingDish || !form.name.trim()) return;
    const updated = await api.updateDish(editingDish.id, form);
    setDishes(dishes.map((d) => (d.id === editingDish.id ? updated : d)));
    setShowModal(false);
    setEditingDish(null);
    setForm({ name: "", category: "main", ingredientList: "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מנה זו?")) return;
    await api.deleteDish(id);
    setDishes(dishes.filter((d) => d.id !== id));
    // Also remove any dinnerDish links
    const ddToRemove = dinnerDishes.filter((dd) => dd.dishId === id);
    for (const dd of ddToRemove) {
      await api.deleteDinnerDish(dd.id);
    }
    setDinnerDishes(dinnerDishes.filter((dd) => dd.dishId !== id));
  };

  const handleDuplicate = (dish) => {
    setForm({
      name: `${dish.name} (עותק)`,
      category: dish.category,
      ingredientList: dish.ingredientList || "",
    });
    setShowModal(true);
  };

  const openEdit = (dish) => {
    setEditingDish(dish);
    setForm({
      name: dish.name || "",
      category: dish.category || "main",
      ingredientList: dish.ingredientList || "",
    });
    setShowModal(true);
  };

  // Get dishes assigned to a specific dinner
  const getDishesForDinner = (did) =>
    dinnerDishes.filter((dd) => dd.dinnerId === did);

  // Get dinner name by ID
  const getDinnerName = (did) => {
    const dinner = dinners.find((d) => d.id === did);
    return dinner ? dinner.name : did;
  };

  // Get family name by ID
  const getFamilyName = (familyId) => {
    const family = families.find((f) => f.id === familyId);
    return family ? family.name : "לא יועד";
  };

  const getCategoryLabel = (cat) => {
    const found = categories.find((c) => c.value === cat);
    return found ? found.label : cat;
  };

  // Assign dish to dinner
  const handleAssignDish = async (dishId, dinnerIdToAssign, familyId) => {
    const dd = await api.createDinnerDish({
      dishId,
      dinnerId: dinnerIdToAssign,
      familyId,
    });
    setDinnerDishes([...dinnerDishes, dd]);
    setShowAssignModal(null);
  };

  // Unassign dish from dinner
  const handleUnassignDish = async (ddId) => {
    await api.deleteDinnerDish(ddId);
    setDinnerDishes(dinnerDishes.filter((dd) => dd.id !== ddId));
  };

  const filteredDishes = dishes.filter((d) => {
    if (filterCategory !== "all" && d.category !== filterCategory) return false;
    return true;
  });

  // When viewing dishes for a specific dinner, show assign modal
  const availableDishesForDinner = dinnerId
    ? dishes.filter(
        (d) => !getDishesForDinner(dinnerId).some((dd) => dd.dishId === d.id),
      )
    : [];

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
          {dinnerId && <p>ניהול מנות לארוחה: {getDinnerName(dinnerId)}</p>}
          {!dinnerId && (
            <p>מאגר המנות - בחר מנה קיימת לארוחה או צור מנה חדשה</p>
          )}
          {dinnerId && (
            <Link
              to={`/dinner/${dinnerId}`}
              className="btn btn-outline btn-sm"
              style={{ marginTop: 8 }}
            >
              ← חזרה לסיכום ארוחה
            </Link>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {dinnerId && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowAssignModal(true)}
            >
              📌 חבר מנה קיימת
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + צור מנה
          </button>
        </div>
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
          <p>צור מנה ראשונה כדי לבנות את מאגר המנות</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredDishes.map((dish) => {
            const assignedDinners = getDishesForDinner
              ? dinnerDishes.filter((dd) => dd.dishId === dish.id)
              : [];
            return (
              <div key={dish.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 18, marginBottom: 8 }}>
                      {dish.name}
                    </h3>
                    <span className="badge badge-primary">
                      {getCategoryLabel(dish.category)}
                    </span>
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
                    {/* Show which dinners this dish is assigned to */}
                    {assignedDinners.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {assignedDinners.map((dd) => (
                          <span
                            key={dd.id}
                            className="badge badge-secondary"
                            style={{
                              marginRight: 4,
                              marginBottom: 4,
                              display: "inline-block",
                            }}
                          >
                            🍽️ {getDinnerName(dd.dinnerId)} —{" "}
                            {getFamilyName(dd.familyId)}
                            <button
                              onClick={() => handleUnassignDish(dd.id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                marginRight: 4,
                                color: "var(--color-danger)",
                                padding: 0,
                                fontSize: 11,
                              }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDuplicate(dish)}
                      title="צור עותק"
                    >
                      📋
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => openEdit(dish)}
                      title="ערוך"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(dish.id)}
                      title="מחק"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit dish modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            setEditingDish(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>
              {editingDish ? "עריכת מנה" : "צור מנה חדשה"}
            </h2>
            <div className="form-group">
              <label>שם המנה</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="למשל: חצילים בשמנת, בורקס גבינה"
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
              <label>מצרכים (מפוסקים בפסיקים)</label>
              <textarea
                value={form.ingredientList}
                onChange={(e) =>
                  setForm({ ...form, ingredientList: e.target.value })
                }
                placeholder="למשל: חצילים, גבינת שמנת, שום, שמן זית"
                rows="3"
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingDish(null);
                }}
              >
                ביטול
              </button>
              <button
                className="btn btn-primary"
                onClick={editingDish ? handleSaveEdit : handleAdd}
              >
                {editingDish ? "שמור" : "צור"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign dish to dinner modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>📌 חבר מנה לארוחה</h2>

            {availableDishesForDinner.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🍽️</div>
                <h3>כל המנות כבר מחוברות לארוחה זו</h3>
                <p>צור מנה חדשה כדי להוסיף</p>
              </div>
            ) : (
              <div className="grid-2" style={{ gap: 8 }}>
                {availableDishesForDinner.map((dish) => (
                  <div
                    key={dish.id}
                    className="card"
                    style={{ cursor: "pointer", padding: 16 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <strong>{dish.name}</strong>
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
                        }}
                      >
                        🥦 {dish.ingredientList}
                      </p>
                    )}
                    <select
                      className="form-group"
                      style={{
                        marginTop: 8,
                        width: "100%",
                        padding: "8px 12px",
                        border: "2px solid var(--color-border)",
                        borderRadius: 12,
                      }}
                      id={`family-${dish.id}`}
                    >
                      <option value="">בחר משפחה...</option>
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 8, width: "100%" }}
                      onClick={() => {
                        const selectEl = document.getElementById(
                          `family-${dish.id}`,
                        );
                        const familyId = selectEl?.value || "";
                        if (!familyId) {
                          alert("אנא בחר משפחה");
                          return;
                        }
                        handleAssignDish(dish.id, dinnerId, familyId);
                      }}
                    >
                      חבר לארוחה
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowAssignModal(null)}
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishesPage;
