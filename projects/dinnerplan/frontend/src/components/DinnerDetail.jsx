import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../data/api";

const avatarColors = [
  "#E8734A", "#6B8F71", "#F4B942", "#7B9ED7",
  "#C45A35", "#4A6B4F", "#96730A", "#D94F4F"
];

const categories = [
  { value: "appetizer", label: "🥗 מנת פתיחה" },
  { value: "main", label: "🥘 מנת עיקרית" },
  { value: "salad", label: "🥬 סלט" },
  { value: "dessert", label: "🍰 קינוח" },
  { value: "drink", label: "🥤 משקה" },
  { value: "bread", label: "🍞 לחם" },
  { value: "other", label: "🍽️ אחר" }
];

const DinnerDetail = ({
  dinnerId, dinners, setDinners,
  families, setFamilies,
  dishes, posts, setPosts,
  refreshData
}) => {
  const dinner = dinners.find((d) => d.id === dinnerId);
  const [countdown, setCountdown] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ author: "", message: "" });

   // Find the dishes for this dinner
  const dinnerDishes = dishes.filter((d) => d.dinnerId === dinnerId);

   // Countdown timer
  useEffect(() => {
    if (!dinner || !dinner.date) return;
    const target = new Date(`${dinner.date}T${dinner.time || "19:00"}`).getTime();

    const update = () => {
      const diff = target - Date.now();
      if (diff < 0) {
       setCountdown("הארוחה חלפה! 🎉");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${days} ימים ו-${hours} שעות ו-${minutes} דקות`);
     };

    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
   }, [dinner]);

   // Update guest list
  const updateGuestAttendees = async (guest, attendees) => {
    const updated = { ...dinner, guestList: dinner.guestList.map((g) => g.familyId === guest.familyId ? { ...g, attendees } : g) };
    await api.updateDinner(dinnerId, updated);
    setDinners(dinners.map((d) => d.id === dinnerId ? updated : d));
   };

   // Add post
  const handleAddPost = async () => {
    if (!postForm.author.trim() || !postForm.message.trim()) return;
    const post = await api.createPost({
      dinnerId,
      author: postForm.author,
      message: postForm.message,
      createdAt: new Date().toISOString()
     });
    setPosts([...posts, post]);
    setShowPostForm(false);
    setPostForm({ author: "", message: "" });
    refreshData();
   };

   // Delete post
  const handleDeletePost = async (id) => {
    await api.deletePost(id);
    setPosts(posts.filter((p) => p.id !== id));
   };

   if (!dinner) {
    return (
       <div className="container">
        <div className="empty-state">
          <div className="icon">🍽️</div>
          <h3>הארוחה לא נמצאה</h3>
          <Link to="/dinners" className="btn btn-primary" style={{ marginTop: 16 }}>
            ← חזרה לארוחות
          </Link>
        </div>
       </div>
     );
    }

  const dinnerDate = dinner.date ? new Date(`${dinner.date}T${dinner.time || "19:00"}`) : null;
  const isPast = dinnerDate && dinnerDate < new Date();

   // Get total attendees
  const totalAttendees = (dinner.guestList || []).reduce((sum, g) => sum + (g.attendees || 0), 0);

   // Format post date
  const formatPostDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("he-IL", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
      });
   };

   // Get family info by ID
  const getFamilyById = (familyId) => families.find((f) => f.id === familyId);

  return (
      <div className="container">
        {/* Breadcrumb */}
        <Link to="/dinners" style={{ color: "var(--color-primary)", marginBottom: 16, display: "inline-block" }}>
          ← חזרה לארוחות
        </Link>

        {/* Header */}
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>
            {dinner.name || "ארוחה"}
            {isPast && <span style={{ fontSize: 16, color: "var(--color-text-light)" }}>(חלפה)</span>}
          </h1>
          {dinnerDate && !isPast && (
            <div style={{ marginBottom: 16 }}>
              <span className="badge badge-accent" style={{ fontSize: 16, padding: "8px 16px" }}>
                ⏳ נשאר {countdown}
              </span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {dinner.date && (
              <span className="badge badge-primary">
                📅{" "}
                {dinnerDate.toLocaleDateString("he-IL", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                  })}
              </span>
            )}
            {dinner.time && (
              <span className="badge badge-secondary">🕐 {dinner.time}</span>
            )}
            {dinner.location && (
              <span className="badge badge-secondary">📍 {dinner.location}</span>
            )}
          </div>
          {dinner.notes && (
            <p style={{ marginTop: 16, color: "var(--color-text-light)" }}>{dinner.notes}</p>
          )}
        </div>

        {/* Guest list */}
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>👨‍👩‍👧‍👦 מוזמנים ({totalAttendees} אנשים)</h2>
          {!dinner.guestList || dinner.guestList.length === 0 ? (
            <p style={{ color: "var(--color-text-light)" }}>אין עדיין משפחות מוזמנות. נוסיף דרך דף הארוחות.</p>
          ) : (
            <div>
              {dinner.guestList.map((guest, idx) => {
                const family = getFamilyById(guest.familyId);
                return (
                  <div
                  key={guest.familyId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <div className="family-avatar" style={{ background: avatarColors[idx % avatarColors.length], width: 44, height: 44, fontSize: 18 }}>
                      {family ? family.name.charAt(0) : "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong>{family ? family.name : guest.familyId}</strong>
                      {family && family.members && (
                        <p style={{ fontSize: 13, color: "var(--color-text-light)" }}>
                          {family.members.join(", ")}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                       className="btn btn-sm btn-outline"
                       style={{ width: 32, height: 32, padding: 0 }}
                       onClick={() => updateGuestAttendees(guest, Math.max(0, (guest.attendees || 0) - 1))}
                       >
                        −
                      </button>
                      <span style={{ fontSize: 18, fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                        {guest.attendees || 0}
                      </span>
                      <button
                       className="btn btn-sm btn-outline"
                       style={{ width: 32, height: 32, padding: 0 }}
                       onClick={() => updateGuestAttendees(guest, (guest.attendees || 0) + 1)}
                       >
                        +
                      </button>
                      <span style={{ fontSize: 13, color: "var(--color-text-light)" }}>אורחים</span>
                    </div>
                  </div>
                 );
               })}
            </div>
          )}
        </div>

        {/* Dishes */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>🥘 המנות מתוכננות</h2>
            <Link to={`/dishes/${dinnerId}`} className="btn btn-secondary btn-sm">
              📝 ניהול מנות
            </Link>
          </div>
          {dinnerDishes.length === 0 ? (
            <p style={{ color: "var(--color-text-light)" }}>
            עדיין לא מתוכננות מנות לארוחה זו.{" "}
            <Link to={`/dishes/${dinnerId}`} style={{ color: "var(--color-primary)" }}>
            הוסף מנות →
            </Link>
            </p>
          ) : (
            <div className="grid-2">
              {dinnerDishes.map((dish) => {
                const family = getFamilyById(dish.familyId);
                const cat = categories.find((c) => c.value === dish.category);
                return (
                  <div key={dish.id} style={{ padding: 12, border: "1px solid var(--color-border)", borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong>{dish.name}</strong>
                      <span className="badge badge-primary" style={{ fontSize: 12 }}>{cat ? cat.label : ""}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--color-text-light)" }}>
                      👨‍👩‍👧‍👦 {family ? family.name : "לא יועד"}
                    </p>
                  </div>
                 );
               })}
            </div>
          )}
        </div>

        {/* Blog / Posts */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>💬 שיחה</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowPostForm(true)}>
              ✏️ כתבו הודעה
            </button>
          </div>

          {posts.filter((p) => p.dinnerId === dinnerId).length === 0 ? (
            <p style={{ color: "var(--color-text-light)" }}>
            עדיין אין הודעות. כתבו את ההודעה הראשונה!
            </p>
          ) : (
            <div>
              {posts
                .filter((p) => p.dinnerId === dinnerId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((post, idx) => (
                  <div
                   key={post.id}
                   style={{
                     padding: "12px 0",
                     borderBottom: idx < posts.filter((p) => p.dinnerId === dinnerId).length - 1 ? "1px solid var(--color-border)" : "none",
                     }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <strong style={{ color: "var(--color-primary)" }}>{post.author}</strong>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--color-text-light)" }}>
                          {formatPostDate(post.createdAt)}
                        </span>
                        <button
                         className="btn btn-danger btn-sm"
                         style={{ padding: "2px 8px", fontSize: 11 }}
                         onClick={() => handleDeletePost(post.id)}
                         >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 16, lineHeight: 1.6 }}>{post.message}</p>
                  </div>
                 ))}
            </div>
          )}

          {/* Post form modal */}
          {showPostForm && (
            <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ marginBottom: 20 }}>✏️ כתבו הודעה</h2>
                <div className="form-group">
                  <label>שם</label>
                  <input
                   type="text"
                   value={postForm.author}
                   onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                   placeholder="איך קוראים לך?"
                   autoFocus
                   />
                </div>
                <div className="form-group">
                  <label>הודעה</label>
                  <textarea
                   value={postForm.message}
                   onChange={(e) => setPostForm({ ...postForm, message: e.target.value })}
                   placeholder="מה רוצים לשתף?"
                   rows="4"
                   />
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button className="btn btn-outline" onClick={() => setShowPostForm(false)}>ביטול</button>
                  <button className="btn btn-primary" onClick={handleAddPost}>שלח 🚀</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
     );
};

export default DinnerDetail;
