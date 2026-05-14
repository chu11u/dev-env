import React, { useState, useEffect } from "react";
import { api } from "../data/api";

const ShoppingPage = ({ shopping, setShopping, dishes }) => {
  const [showModal, setShowModal] = useState(false);
  const [filterPurchased, setFilterPurchased] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    purchaser: "",
    purchased: false,
  });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const item = await api.createShoppingItem(form);
    setShopping([...shopping, item]);
    setShowModal(false);
    setForm({ name: "", quantity: "", purchaser: "", purchased: false });
  };

  const togglePurchased = async (item) => {
    const updated = { ...item, purchased: !item.purchased };
    const saved = await api.updateShoppingItem(item.id, updated);
    setShopping(shopping.map((s) => (s.id === item.id ? saved : s)));
  };

  const handleDelete = async (id) => {
    await api.deleteShoppingItem(id);
    setShopping(shopping.filter((s) => s.id !== id));
  };

  const filteredShopping = shopping.filter((s) => {
    if (filterPurchased === "purchased") return s.purchased;
    if (filterPurchased === "pending") return !s.purchased;
    return true;
  });

  // Auto-generate shopping from dishes
  const autoGenerateShopping = async () => {
    const existingItems = shopping.map((s) => s.name.toLowerCase());
    const newItems = [];
    dishes.forEach((dish) => {
      if (dish.ingredientList) {
        const ingredients = dish.ingredientList
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);
        ingredients.forEach((ingredient) => {
          if (
            !existingItems.includes(ingredient.toLowerCase()) &&
            !shopping.find(
              (s) => s.name.toLowerCase() === ingredient.toLowerCase(),
            )
          ) {
            newItems.push({
              name: ingredient,
              quantity: "",
              purchaser: dish.familyId || "",
              purchased: false,
            });
          }
        });
      }
    });

    if (newItems.length === 0) {
      alert("אין מצרכים חדשים להוספה");
      return;
    }

    if (!confirm(`הוסף ${newItems.length} פריטים לרשימת הקניות?`)) return;

    try {
      for (const item of newItems) {
        await api.createShoppingItem(item);
      }
      const updated = await api.getShopping();
      setShopping(updated);
    } catch (err) {
      console.error("Failed to add shopping items:", err);
      alert("שגיאה בהוספת פריטים");
    }
  };

  const unpurchasedCount = shopping.filter((s) => !s.purchased).length;

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
          <h1>🛒 רשימת קניות</h1>
          <p>מה צריך לקנות - ואיזה משפחה אחראית</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={autoGenerateShopping}>
            🥘 הוסף ממנות
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + הוסף פריט
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
        <button
          className={`btn btn-sm ${filterPurchased === false ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterPurchased(false)}
        >
          הכל ({shopping.length})
        </button>
        <button
          className={`btn btn-sm ${filterPurchased === "pending" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterPurchased("pending")}
        >
          עוד לא נקנה ({unpurchasedCount})
        </button>
        <button
          className={`btn btn-sm ${filterPurchased === "purchased" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterPurchased("purchased")}
        >
          נקנה ({shopping.length - unpurchasedCount})
        </button>
      </div>

      {filteredShopping.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>רשימת הקניות ריקה</h3>
          <p>הוסף פריטים ידנית או השתמש ב"הוסף ממנות"</p>
        </div>
      ) : (
        <div className="card">
          {filteredShopping.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--color-border)",
                opacity: item.purchased ? 0.5 : 1,
                textDecoration: item.purchased ? "line-through" : "none",
              }}
            >
              <input
                type="checkbox"
                checked={item.purchased || false}
                onChange={() => togglePurchased(item)}
                style={{ width: 20, height: 20, cursor: "pointer" }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                {item.quantity && (
                  <span
                    style={{ color: "var(--color-text-light)", marginRight: 8 }}
                  >
                    ({item.quantity})
                  </span>
                )}
              </div>
              {item.purchaser && (
                <span className="badge badge-accent">👤 {item.purchaser}</span>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(item.id)}
                style={{ padding: "4px 8px", fontSize: 12 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>הוסף פריט</h2>
            <div className="form-group">
              <label>שם הפריט</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="למשל: עגבניות, לחם"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>כמות</label>
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="למשל: 2 קילו, 3 יחידות"
              />
            </div>
            <div className="form-group">
              <label>מי קונה?</label>
              <input
                type="text"
                value={form.purchaser}
                onChange={(e) =>
                  setForm({ ...form, purchaser: e.target.value })
                }
                placeholder="למשל: רותי, יונתן"
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

export default ShoppingPage;
