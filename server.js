const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const ITEMS_FILE = "./items.json";
const BRANDS_FILE = "./brands.json";

// Helper function to handle File I/O
const getFileData = (filePath, key) => {
  if (!fs.existsSync(filePath)) {
    // Create file with empty array if it doesn't exist
    const initialData = { [key]: [] };
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    return [];
  }
  const data = JSON.parse(fs.readFileSync(filePath));
  return data[key] || [];
};

const saveFileData = (filePath, key, newData) => {
  fs.writeFileSync(filePath, JSON.stringify({ [key]: newData }, null, 2));
};

// --- ITEMS ROUTES ---
app.get("/items", (req, res) => {
  res.json(getFileData(ITEMS_FILE, "items"));
});

app.post("/items", (req, res) => {
  const item = req.body.item?.trim();
  if (!item) return res.status(400).json({ error: "Item cannot be empty" });

  let items = getFileData(ITEMS_FILE, "items");
  if (!items.some(v => v.toLowerCase() === item.toLowerCase())) {
    items.push(item);
    saveFileData(ITEMS_FILE, "items", items);
  }
  res.json(items);
});

// --- BRANDS ROUTES ---
app.get("/brands", (req, res) => {
  res.json(getFileData(BRANDS_FILE, "brands"));
});

app.post("/brands", (req, res) => {
  const brand = req.body.brand?.trim();
  if (!brand) return res.status(400).json({ error: "Brand cannot be empty" });

  let brands = getFileData(BRANDS_FILE, "brands");
  
  // Prevent duplicate brands (case insensitive)
  const exists = brands.some(v => v.toLowerCase() === brand.toLowerCase());

  if (!exists) {
    brands.push(brand);
    saveFileData(BRANDS_FILE, "brands", brands);
  }

  res.json(brands);
});

const COLORS_FILE = "./colors.json";

// ... existing items and brands routes ...

// --- COLORS ROUTES ---
app.get("/colors", (req, res) => {
  res.json(getFileData(COLORS_FILE, "colors"));
});

app.post("/colors", (req, res) => {
  const color = req.body.color?.trim();
  if (!color) return res.status(400).json({ error: "Color cannot be empty" });

  let colors = getFileData(COLORS_FILE, "colors");
  
  const exists = colors.some(v => v.toLowerCase() === color.toLowerCase());

  if (!exists) {
    colors.push(color);
    saveFileData(COLORS_FILE, "colors", colors);
  }

  res.json(colors);
});


const CATEGORIES_FILE = "./categories.json";

// --- CATEGORIES ROUTES ---
app.get("/categories", (req, res) => {
  res.json(getFileData(CATEGORIES_FILE, "categories"));
});

app.post("/categories", (req, res) => {
  const category = req.body.category?.trim();
  if (!category) return res.status(400).json({ error: "Category cannot be empty" });

  let categories = getFileData(CATEGORIES_FILE, "categories");
  
  // Prevent duplicate categories (case insensitive)
  const exists = categories.some(v => v.toLowerCase() === category.toLowerCase());

  if (!exists) {
    categories.push(category);
    saveFileData(CATEGORIES_FILE, "categories", categories);
  }

  res.json(categories);
});
const SLEEVES_FILE = "./sleevetypes.json";
const NECKS_FILE = "./necktypes.json";

// --- SLEEVE TYPE ROUTES ---
app.get("/sleevetypes", (req, res) => {
  res.json(getFileData(SLEEVES_FILE, "sleeves"));
});

app.post("/sleevetypes", (req, res) => {
  const sleeve = req.body.sleeve?.trim();
  if (!sleeve) return res.status(400).json({ error: "Sleeve type cannot be empty" });

  let sleeves = getFileData(SLEEVES_FILE, "sleeves");
  if (!sleeves.some(v => v.toLowerCase() === sleeve.toLowerCase())) {
    sleeves.push(sleeve);
    saveFileData(SLEEVES_FILE, "sleeves", sleeves);
  }
  res.json(sleeves);
});

// --- NECK TYPE ROUTES ---
app.get("/necktypes", (req, res) => {
  res.json(getFileData(NECKS_FILE, "necks"));
});

app.post("/necktypes", (req, res) => {
  const neck = req.body.neck?.trim();
  if (!neck) return res.status(400).json({ error: "Neck type cannot be empty" });

  let necks = getFileData(NECKS_FILE, "necks");
  if (!necks.some(v => v.toLowerCase() === neck.toLowerCase())) {
    necks.push(neck);
    saveFileData(NECKS_FILE, "necks", necks);
  }
  res.json(necks);
});


app.listen(5000, () => console.log("Server running on port 5000"));