const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join('/app/data', 'data.json');
const file = new JSONFile(dbPath);
const db = new Low(file);

const defaultData = {
  families: [],
  dinners: [],
  dishes: [],
  shoppingItems: []
};

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'dinnerplan' });
});

// API: Get all data
app.get('/api/data', async (req, res) => {
  try {
    await db.read();
    const data = db.data || defaultData;
    res.json(data);
  } catch (err) {
    res.json(defaultData);
  }
});

// API: Save all data
app.post('/api/data', async (req, res) => {
  try {
    await db.write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FAMILIES ---
app.get('/api/families', async (req, res) => {
  await db.read();
  res.json(db.data?.families || []);
});

app.post('/api/families', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const family = { id: Date.now().toString(), ...req.body };
  data.families.push(family);
  await db.write();
  res.status(201).json(family);
});

app.put('/api/families/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const idx = data.families.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.families[idx] = { ...data.families[idx], ...req.body };
  await db.write();
  res.json(data.families[idx]);
});

app.delete('/api/families/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  data.families = data.families.filter(f => f.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

// --- DINNERS ---
app.get('/api/dinners', async (req, res) => {
  await db.read();
  res.json(db.data?.dinners || []);
});

app.post('/api/dinners', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const dinner = { id: Date.now().toString(), ...req.body };
  data.dinners.push(dinner);
  await db.write();
  res.status(201).json(dinner);
});

app.put('/api/dinners/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const idx = data.dinners.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.dinners[idx] = { ...data.dinners[idx], ...req.body };
  await db.write();
  res.json(data.dinners[idx]);
});

app.delete('/api/dinners/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  data.dinners = data.dinners.filter(d => d.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

// --- DISHES ---
app.get('/api/dishes', async (req, res) => {
  await db.read();
  res.json(db.data?.dishes || []);
});

app.post('/api/dishes', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const dish = { id: Date.now().toString(), ...req.body };
  data.dishes.push(dish);
  await db.write();
  res.status(201).json(dish);
});

app.put('/api/dishes/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const idx = data.dishes.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.dishes[idx] = { ...data.dishes[idx], ...req.body };
  await db.write();
  res.json(data.dishes[idx]);
});

app.delete('/api/dishes/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  data.dishes = data.dishes.filter(d => d.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

// --- SHOPPING ITEMS ---
app.get('/api/shopping', async (req, res) => {
  await db.read();
  res.json(db.data?.shoppingItems || []);
});

app.post('/api/shopping', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const item = { id: Date.now().toString(), ...req.body };
  data.shoppingItems.push(item);
  await db.write();
  res.status(201).json(item);
});

app.put('/api/shopping/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  const idx = data.shoppingItems.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.shoppingItems[idx] = { ...data.shoppingItems[idx], ...req.body };
  await db.write();
  res.json(data.shoppingItems[idx]);
});

app.delete('/api/shopping/:id', async (req, res) => {
  await db.read();
  const data = db.data || defaultData;
  data.shoppingItems = data.shoppingItems.filter(i => i.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dinnerplan backend running on port ${PORT}`);
});
