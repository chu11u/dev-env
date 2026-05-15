const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "/app/data/data.json";
const DEFAULT_DATA = {
  families: [],
  dinners: [],
  dishes: [],
  shoppingItems: [],
  dinnerDishes: [],
  posts: [],
};

// Auto-migrate: move old dish.dinnerId/dish.familyId to dinnerDishes linking table
function migrate() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    let migrated = 0;
    if (!data.dinnerDishes) data.dinnerDishes = [];
    data.dishes.forEach((dish) => {
      if (dish.dinnerId) {
        data.dinnerDishes.push({
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          dishId: dish.id,
          dinnerId: dish.dinnerId,
          familyId: dish.familyId || "",
        });
        delete dish.dinnerId;
        delete dish.familyId;
        migrated++;
      }
    });
    if (migrated > 0) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log(
        `🔄 Migrated ${migrated} dish→dinner links to dinnerDishes table`,
      );
    }
  } catch (e) {
    console.error("Migration error:", e);
  }
}
migrate();

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error reading data:", e);
  }
  return { ...DEFAULT_DATA };
}

function saveData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Helper: CRUD generator for a collection
function crudRoutes(name, collection) {
  app.get(`/api/${collection}`, (req, res) => {
    res.json(loadData()[collection] || []);
  });

  app.post(`/api/${collection}`, (req, res) => {
    const data = loadData();
    const item = { id: Date.now().toString(), ...req.body };
    (data[collection] || (data[collection] = [])).push(item);
    saveData(data);
    res.status(201).json(item);
  });

  app.put(`/api/${collection}/:id`, (req, res) => {
    const data = loadData();
    const arr = data[collection] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    arr[idx] = { ...arr[idx], ...req.body };
    saveData(data);
    res.json(arr[idx]);
  });

  app.delete(`/api/${collection}/:id`, (req, res) => {
    const data = loadData();
    const arr = data[collection] || [];
    data[collection] = arr.filter((x) => x.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });
}

// ===== Health =====
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", project: "dinnerplan", uptime: process.uptime() });
});

// ===== Full Data =====
app.get("/api/data", (req, res) => {
  res.json(loadData());
});

app.post("/api/data", (req, res) => {
  saveData(req.body);
  res.json({ success: true });
});

// ===== Collections (auto CRUD) =====
crudRoutes("Families", "families");
crudRoutes("Dinners", "dinners");
crudRoutes("Dishes", "dishes");
crudRoutes("Shopping", "shoppingItems");
crudRoutes("DinnerDishes", "dinnerDishes");
crudRoutes("Posts", "posts");

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Dinnerplan API running on port ${PORT}`);
});
