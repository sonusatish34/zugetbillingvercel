const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const CONFIG = {
  items:       { file: "./items.json",       key: "items" },
  brands:      { file: "./brands.json",      key: "brands" },
  colors:      { file: "./colors.json",      key: "colors" },
  categories:  { file: "./categories.json",  key: "categories" },
  sleevetypes: { file: "./sleevetypes.json", key: "sleeves" },
  necktypes:   { file: "./necktypes.json",   key: "necks" },
};

const ensureFileInitialized = (type) => {
  const { file, key } = CONFIG[type];
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ [key]: [] }, null, 2));
  }
};

const getFileData = (type) => {
  const { file, key } = CONFIG[type];
  ensureFileInitialized(type);
  try {
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(json[key]) ? json[key] : [];
  } catch (e) {
    // reset file if corrupted
    fs.writeFileSync(file, JSON.stringify({ [key]: [] }, null, 2));
    return [];
  }
};

const saveFileData = (type, dataArray) => {
  const { file, key } = CONFIG[type];
  fs.writeFileSync(file, JSON.stringify({ [key]: dataArray }, null, 2));
};

// GET /items, /colors, /categories, /sleevetypes, /necktypes, /brands
app.get("/:type", (req, res) => {
  const type = req.params.type;
  if (!CONFIG[type]) return res.status(404).send("Not found");
  const data = getFileData(type);
  res.json(data);
});

// POST /items, /colors, /categories, /sleevetypes, /necktypes, /brands
app.post("/:type", (req, res) => {
  const type = req.params.type;
  if (!CONFIG[type]) return res.status(404).send("Not found");

  const { key } = CONFIG[type];

  // derive field name: items -> item, colors -> color, sleevetypes -> sleeve, necktypes -> neck etc.
  const singular = key.replace(/s$/, ""); // items -> item, brands -> brand, sleeves -> sleeve, necks -> neck
  const bodyValue =
    (req.body[singular] ??
      req.body[type.slice(0, -1)] ?? // sleevetypes -> sleevetype (fallback)
      req.body[key]) || "";          // last fallback

  const value = String(bodyValue).trim();
  if (!value) {
    return res.status(400).json({ error: "Empty value" });
  }

  let data = getFileData(type);

  // case‑insensitive duplicate check
  const exists = data.some(
    (v) => String(v).toLowerCase() === value.toLowerCase()
  );
  if (!exists) {
    data.push(value);
    saveFileData(type, data);
  }

  res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));
