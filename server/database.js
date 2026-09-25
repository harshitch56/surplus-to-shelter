const Database = require("better-sqlite3");

const db = new Database("surplus2shelter.db");

db.exec(`
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor TEXT,
  food_name TEXT,
  quantity INTEGER,
  status TEXT DEFAULT 'PENDING_SAFETY',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS safety_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER,
  fssai INTEGER,
  preparation_time TEXT,
  expiry_time TEXT,
  temperature REAL,
  packaging INTEGER,
  hygiene INTEGER,
  contamination INTEGER,
  safe INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ngos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  required_meals INTEGER,
  available_meals INTEGER,
  urgency TEXT,
  location TEXT
);

CREATE TABLE IF NOT EXISTS needy_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  people INTEGER,
  meals INTEGER,
  location TEXT,
  contact TEXT,
  status TEXT DEFAULT 'PENDING_MATCH'
);

CREATE TABLE IF NOT EXISTS deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER,
  recipient TEXT,
  pickup TEXT,
  drop_location TEXT,
  meals INTEGER,
  driver TEXT,
  status TEXT DEFAULT 'AVAILABLE',
  otp TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;