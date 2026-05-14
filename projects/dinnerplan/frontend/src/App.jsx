import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  useParams,
  Link,
} from "react-router-dom";
import { api } from "./data/api";
import Home from "./components/Home";
import FamiliesPage from "./components/FamiliesPage";
import DinnersPage from "./components/DinnersPage";
import DinnerDetail from "./components/DinnerDetail";
import DishesPage from "./components/DishesPage";
import ShoppingPage from "./components/ShoppingPage";

const Layout = () => {
  const location = useLocation();
  const [families, setFamilies] = useState([]);
  const [dinners, setDinners] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [f, d, di, s, p] = await Promise.all([
        api.getFamilies(),
        api.getDinners(),
        api.getDishes(),
        api.getShopping(),
        api.getPosts(),
      ]);
      setFamilies(f);
      setDinners(d);
      setDishes(di);
      setShopping(s);
      setPosts(p);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  const navItems = [
    { path: "/", label: "🏠 בית" },
    { path: "/families", label: "👨‍👩‍👧‍👦 משפחות" },
    { path: "/dinners", label: "🍽️ ארוחות" },
    { path: "/dishes", label: "🥘 מנות" },
    { path: "/shopping", label: "🛒 קניות" },
  ];

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "48px", textAlign: "center" }}
      >
        טוען...
      </div>
    );
  }

  return (
    <div>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">
            🍴 DinnerPlan
          </Link>
          <nav className="app-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main style={{ padding: "24px 0" }}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                families={families}
                dinners={dinners}
                dishes={dishes}
                shopping={shopping}
              />
            }
          />
          <Route
            path="/families"
            element={
              <FamiliesPage families={families} setFamilies={setFamilies} />
            }
          />
          <Route
            path="/dinners"
            element={
              <DinnersPage
                dinners={dinners}
                setDinners={setDinners}
                families={families}
                refreshData={refreshData}
              />
            }
          />
          <Route
            path="/dinner/:id"
            element={
              <DinnerDetailWrapper
                dinners={dinners}
                setDinners={setDinners}
                families={families}
                setFamilies={setFamilies}
                dishes={dishes}
                posts={posts}
                setPosts={setPosts}
                refreshData={refreshData}
              />
            }
          />
          <Route
            path="/dishes"
            element={
              <DishesPage
                dishes={dishes}
                setDishes={setDishes}
                families={families}
                dinnerId={null}
              />
            }
          />
          <Route
            path="/dishes/:dinnerId"
            element={
              <DishesPageWrapper
                dishes={dishes}
                setDishes={setDishes}
                families={families}
              />
            }
          />
          <Route
            path="/shopping"
            element={
              <ShoppingPage
                shopping={shopping}
                setShopping={setShopping}
                dishes={dishes}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const DinnerDetailWrapper = ({
  dinners,
  setDinners,
  families,
  setFamilies,
  dishes,
  posts,
  setPosts,
  refreshData,
}) => {
  const { id } = useParams();
  return (
    <DinnerDetail
      dinnerId={id}
      dinners={dinners}
      setDinners={setDinners}
      families={families}
      setFamilies={setFamilies}
      dishes={dishes}
      posts={posts}
      setPosts={setPosts}
      refreshData={refreshData}
    />
  );
};

const DishesPageWrapper = ({ dishes, setDishes, families }) => {
  const { dinnerId } = useParams();
  return (
    <DishesPage
      dishes={dishes}
      setDishes={setDishes}
      families={families}
      dinnerId={dinnerId}
    />
  );
};

const App = () => (
  <Router>
    <Layout />
  </Router>
);

export default App;
