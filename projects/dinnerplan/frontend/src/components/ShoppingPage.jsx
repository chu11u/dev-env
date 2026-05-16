import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../data/api";

const ShoppingPage = ({
  shopping,
  setShopping,
  dishes,
  dinnerDishes,
  dinners,
  families,
 }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDinnerId, setSelectedDinnerId] = useState("");
  const [filterPurchased, setFilterPurchased] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    purchaser: "",
    purchased: false,
   });

   // Get shopping items for the selected dinner (or all if no dinner selected)
  const dinnerShopping = shopping.filter((item) => {
    if (selectedDinnerId && item.dinnerId !== selectedDinnerId) return false;
    return true;
   });

   // Filter by purchased status
  const filteredShopping = dinnerShopping.filter((s) => {
    if (filterPurchased === "purchased") return s.purchased;
    if (filterPurchased === "pending") return !s.purchased;
    return true;
   });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const item = {
      ...form,
      dinnerId: selectedDinnerId,
     };
    const created = await api.createShoppingItem(item);
    setShopping([...shopping, created]);
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

   // Get dinner name
  const getDinnerName = (dinnerId) => {
    const dinner = dinners.find((d) => d.id === dinnerId);
    return dinner ? dinner.name : "";
   };

   // Get family name
  const getFamilyName = (familyId) => {
    const family = families.find((f) => f.id === familyId);
    return family ? family.name : "";
   };

   // Auto-generate shopping from dishes assigned to the selected dinner
  const autoGenerateShopping = async () => {
    if (!selectedDinnerId) {
      alert("אנא בחר ארוחה תחילה");
      return;
     }

      // Get dishes for this dinner
    const linkedDinnerDishes = dinnerDishes.filter(
      (dd) => dd.dinnerId === selectedDinnerId,
     );

    const linkedDishes = linkedDinnerDishes
       .map((dd) => ({ dish: dishes.find((d) => d.id === dd.dishId), familyId: dd.familyId }))
       .filter((item) => item.dish);

    const existingNames = dinnerShopping.map((s) => s.name.toLowerCase());
    const newItems = [];

    linkedDishes.forEach(({ dish, familyId }) => {
      if (dish.ingredientList) {
        const ingredients = dish.ingredientList
           .split(",")
           .map((i) => i.trim())
           .filter(Boolean);
        ingredients.forEach((ingredient) => {
          if (!existingNames.includes(ingredient.toLowerCase())) {
            newItems.push({
              name: ingredient,
              quantity: "",
              purchaser: getFamilyName(familyId) || "",
              purchased: false,
              dinnerId: selectedDinnerId,
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

  const unpurchasedCount = dinnerShopping.filter((s) => !s.purchased).length;

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
           {selectedDinnerId ? (
             <p>קניות לארוחה: {getDinnerName(selectedDinnerId)}</p>
           ) : (
             <p>בחר ארוחה כדי לראות את רשימת הקניות</p>
           )}
         </div>
         <div style={{ display: "flex", gap: 8 }}>
           <button
            className="btn btn-secondary"
            onClick={autoGenerateShopping}
            disabled={!selectedDinnerId}
           >
             🥘 הוסף ממנות
           </button>
           <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!selectedDinnerId}
           >
             + הוסף פריט
           </button>
         </div>
       </div>

       {/* Dinner selector */}
       <div style={{ marginBottom: 20 }}>
         <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
           🍽️ בחר ארוחה
         </label>
         <select
          className="form-group"
          style={{ maxWidth: "400px" }}
          value={selectedDinnerId}
          onChange={(e) => setSelectedDinnerId(e.target.value)}
         >
           <option value="">-- ארוחה כללית (ללא ארוחה ספציפית) --</option>
           {dinners.map((dinner) => (
             <option key={dinner.id} value={dinner.id}>
               {dinner.name}
               {dinner.date ? ` (${dinner.date})` : ""}
             </option>
           ))}
         </select>
         {selectedDinnerId && (
           <Link
            to={`/dinner/${selectedDinnerId}`}
            className="btn btn-sm btn-outline"
            style={{ marginTop: 8, display: "inline-block" }}
           >
             ← חזרה לסיכום ארוחה
           </Link>
          )}
       </div>

       {/* Filters */}
       <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
         <button
          className={`btn btn-sm ${filterPurchased === false ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterPurchased(false)}
         >
          הכל ({dinnerShopping.length})
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
          נקנה ({dinnerShopping.length - unpurchasedCount})
         </button>
       </div>

       {filteredShopping.length === 0 ? (
         <div className="empty-state">
           <div className="icon">🛒</div>
           <h3>{selectedDinnerId ? "רשימת הקניות ריקה" : "בחר ארוחה"}</h3>
           <p>
             {selectedDinnerId
               ? "הוסף פריטים ידנית או השתמש ב\"הוסף ממנות\""
               : "בחר ארוחה מהרשימה למעלה כדי לראות את רשימת הקניות"}
           </p>
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

       {/* Add item modal */}
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
               <label>מי קונה? (משפחה)</label>
               <select
                value={form.purchaser}
                onChange={(e) => setForm({ ...form, purchaser: e.target.value })}
               >
                 <option value="">בחר משפחה...</option>
                 {families.map((family) => (
                   <option key={family.id} value={family.name}>
                     {family.name}
                   </option>
                 ))}
               </select>
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
