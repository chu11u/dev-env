import React from "react";
import { Link } from "react-router-dom";

const Home = ({ families, dinners, dishes, shopping }) => {
  const upcomingDinners = dinners
    .filter((d) => !d.date || new Date(d.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="container">
      <div className="page-header">
        <h1>ברוכים הבאים! 🍴</h1>
        <p>תכנון ארוחות משפחתיות - כל מה שצריך במקום אחד</p>
      </div>

      {/* Stats overview */}
      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="card">
          <div className="family-card">
            <div className="family-avatar" style={{ background: "#E8734A" }}>
              👨‍👩‍👧‍👦
            </div>
            <div className="family-info">
              <h3>{families.length} משפחות</h3>
              <p>המשפחות שמשתתפות</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="family-card">
            <div className="family-avatar" style={{ background: "#6B8F71" }}>
              🍽️
            </div>
            <div className="family-info">
              <h3>{dinners.length} ארוחות מתוכננות</h3>
              <p>ארוחות שנקבעו מראש</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="family-card">
            <div className="family-avatar" style={{ background: "#F4B942" }}>
              🥘
            </div>
            <div className="family-info">
              <h3>{dishes.length} מנות</h3>
              <p>מנות שתוכננו</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="family-card">
            <div className="family-avatar" style={{ background: "#7B9ED7" }}>
              🛒
            </div>
            <div className="family-info">
              <h3>
                {shopping.filter((s) => !s.purchased).length} פריטים לקנייה
              </h3>
              <p>עוד צריך לקנות</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="page-header">
        <h2>פעולות מהירות</h2>
      </div>
      <div className="grid-2">
        <Link
          to="/families"
          className="card"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
          <h3>ניהול משפחות</h3>
          <p style={{ color: "var(--color-text-light)" }}>הוסף ונהל משפחות</p>
        </Link>

        <Link
          to="/dinners"
          className="card"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <h3>תכנון ארוחות</h3>
          <p style={{ color: "var(--color-text-light)" }}>
            קבע תאריכים ומיקומים
          </p>
        </Link>

        <Link
          to="/dishes"
          className="card"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🥘</div>
          <h3>תכנון מנות</h3>
          <p style={{ color: "var(--color-text-light)" }}>מי מכין מה?</p>
        </Link>

        <Link
          to="/shopping"
          className="card"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <h3>רשימת קניות</h3>
          <p style={{ color: "var(--color-text-light)" }}>מה צריך לקנות</p>
        </Link>
      </div>

      {/* Upcoming dinners */}
      {upcomingDinners.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="page-header">
            <h2>ארוחות קרובות</h2>
          </div>
          {upcomingDinners.map((dinner) => (
            <div key={dinner.id} className="card">
              <div className="family-card">
                <div
                  className="family-avatar"
                  style={{ background: "var(--color-secondary)" }}
                >
                  🍽️
                </div>
                <div className="family-info">
                  <h3>{dinner.name || "ארוחה"}</h3>
                  <p>
                    {dinner.date &&
                      new Date(dinner.date).toLocaleDateString("he-IL")}
                    {dinner.location && ` • ${dinner.location}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
