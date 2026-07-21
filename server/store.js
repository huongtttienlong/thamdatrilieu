const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'thamdatrilieu';

// ---------- File backend (dự phòng khi chưa cấu hình MongoDB) ----------
function ensureFile(file) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8');
}

function readJSON(file) {
  ensureFile(file);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}

function writeJSON(file, data) {
  ensureFile(file);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function fileAdd(file, entry) {
  const arr = readJSON(file);
  arr.push(entry);
  writeJSON(file, arr);
  return entry;
}

// ---------- MongoDB backend (dùng khi có biến môi trường MONGODB_URI) ----------
let dbPromise = null;

function getDb() {
  if (!MONGODB_URI) return null;
  if (!dbPromise) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGODB_URI, { maxPoolSize: 5 });
    dbPromise = client
      .connect()
      .then(() => {
        console.log('Đã kết nối MongoDB — dữ liệu khách hàng được lưu vĩnh viễn.');
        return client.db(DB_NAME);
      })
      .catch((err) => {
        console.error('Không kết nối được MongoDB, tạm dùng file:', err.message);
        dbPromise = null; // cho phép thử lại lần sau
        throw err;
      });
  }
  return dbPromise;
}

async function addVisit(entry) {
  if (MONGODB_URI) {
    try {
      const db = await getDb();
      await db.collection('visits').insertOne({ ...entry });
      return entry;
    } catch (err) {
      // ngã về file để không mất dữ liệu
    }
  }
  return fileAdd(VISITS_FILE, entry);
}

async function getVisits() {
  if (MONGODB_URI) {
    try {
      const db = await getDb();
      return await db.collection('visits').find({}, { projection: { _id: 0 } }).toArray();
    } catch (err) {
      return readJSON(VISITS_FILE);
    }
  }
  return readJSON(VISITS_FILE);
}

async function addLead(entry) {
  if (MONGODB_URI) {
    try {
      const db = await getDb();
      await db.collection('leads').insertOne({ ...entry });
      return entry;
    } catch (err) {
      // ngã về file để không mất khách hàng
      return fileAdd(LEADS_FILE, entry);
    }
  }
  return fileAdd(LEADS_FILE, entry);
}

async function getLeads() {
  if (MONGODB_URI) {
    try {
      const db = await getDb();
      return await db.collection('leads').find({}, { projection: { _id: 0 } }).toArray();
    } catch (err) {
      return readJSON(LEADS_FILE);
    }
  }
  return readJSON(LEADS_FILE);
}

module.exports = { addVisit, getVisits, addLead, getLeads };
