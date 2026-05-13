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
};

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

// ===== Families =====
app.get("/api/families", (req, res) => {
  res.json(loadData().families);
});

app.post("/api/families", (req, res) => {
  const data = loadData();
  const family = { id: Date.now().toString(), ...req.body };
  data.families.push(family);
  saveData(data);
  res.status(201).json(family);
});

app.put("/api/families/:id", (req, res) => {
  const data = loadData();
  const idx = data.families.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data.families[idx] = { ...data.families[idx], ...req.body };
  saveData(data);
  res.json(data.families[idx]);
});

app.delete("/api/families/:id", (req, res) => {
  const data = loadData();
  data.families = data.families.filter((f) => f.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// ===== Dinners =====
app.get("/api/dinners", (req, res) => {
  res.json(loadData().dinners);
});

app.post("/api/dinners", (req, res) => {
  const data = loadData();
  const dinner = { id: Date.now().toString(), ...req.body };
  data.dinners.push(dinner);
  saveData(data);
  res.status(201).json(dinner);
});

app.put("/api/dinners/:id", (req, res) => {
  const data = loadData();
  const idx = data.dinners.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data.dinners[idx] = { ...data.dinners[idx], ...req.body };
  saveData(data);
  res.json(data.dinners[idx]);
});

app.delete("/api/dinners/:id", (req, res) => {
  const data = loadData();
  data.dinners = data.dinners.filter((d) => d.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// ===== Dishes =====
app.get("/api/dishes", (req, res) => {
  res.json(loadData().dishes);
});

app.post("/api/dishes", (req, res) => {
  const data = loadData();
  const dish = { id: Date.now().toString(), ...req.body };
  data.dishes.push(dish);
  saveData(data);
  res.status(201).json(dish);
});

app.put("/api/dishes/:id", (req, res) => {
  const data = loadData();
  const idx = data.dishes.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data.dishes[idx] = { ...data.dishes[idx], ...req.body };
  saveData(data);
  res.json(data.dishes[idx]);
});

app.delete("/api/dishes/:id", (req, res) => {
  const data = loadData();
  data.dishes = data.dishes.filter((d) => d.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// ===== Shopping =====
app.get("/api/shopping", (req, res) => {
  res.json(loadData().shoppingItems);
});

app.post("/api/shopping", (req, res) => {
  const data = loadData();
  const item = { id: Date.now().toString(), ...req.body };
  data.shoppingItems.push(item);
  saveData(data);
  res.status(201).json(item);
});

app.put("/api/shopping/:id", (req, res) => {
  const data = loadData();
  const idx = data.shoppingItems.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data.shoppingItems[idx] = { ...data.shoppingItems[idx], ...req.body };
  saveData(data);
  res.json(data.shoppingItems[idx]);
});

app.delete("/api/shopping/:id", (req, res) => {
  const data = loadData();
  data.shoppingItems = data.shoppingItems.filter((i) => i.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Dinnerplan API running on port ${PORT}`);
});
