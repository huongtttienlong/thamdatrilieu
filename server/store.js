const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

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

function addVisit(entry) {
  const visits = readJSON(VISITS_FILE);
  visits.push(entry);
  writeJSON(VISITS_FILE, visits);
  return entry;
}

function getVisits() {
  return readJSON(VISITS_FILE);
}

function addLead(entry) {
  const leads = readJSON(LEADS_FILE);
  leads.push(entry);
  writeJSON(LEADS_FILE, leads);
  return entry;
}

function getLeads() {
  return readJSON(LEADS_FILE);
}

module.exports = { addVisit, getVisits, addLead, getLeads };
