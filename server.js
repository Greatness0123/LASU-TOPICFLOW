const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASS = '',
  DB_NAME = 'topicflow',
  SESSION_SECRET = 'topicflow-secret',
  PORT = 8000
} = process.env;

const STORAGE_FILE = path.join(__dirname, 'data', 'topicflow-storage.json');

const app = express();
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax' }
}));
app.use(express.static(path.join(__dirname)));

let pool;
let demoMode = false;
async function getPool() {
  if (demoMode) return null;
  if (pool) return pool;
  try {
    const starter = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS, multipleStatements: true });
    await starter.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await starter.query(`USE \`${DB_NAME}\``);
    await starter.end();
    pool = mysql.createPool({ host: DB_HOST, user: DB_USER, password: DB_PASS, database: DB_NAME, waitForConnections: true, connectionLimit: 10, queueLimit: 0, charset: 'utf8mb4' });
    return pool;
  } catch (err) {
    console.warn('MySQL connection failed. Starting server in demo mode:', err.message);
    demoMode = true;
    return null;
  }
}

const demoUsers = [
  { id: 1, name: 'Pius Tana', email: 'piusutana121@gmail.com', password: bcrypt.hashSync('Pius-1234', 10), role: 'admin', capacity: 0, area: '' },
  { id: 2, name: 'Dr. Adaeze Okafor', email: 'adaeze@topicflow.test', password: bcrypt.hashSync('Pius-1234', 10), role: 'supervisor', capacity: 6, area: 'Artificial Intelligence' },
  { id: 3, name: 'Prof. Ibrahim Musa', email: 'ibrahim@topicflow.test', password: bcrypt.hashSync('Pius-1234', 10), role: 'supervisor', capacity: 6, area: 'Data Science' },
  { id: 4, name: 'Dr. Chinedu Eze', email: 'chinedu@topicflow.test', password: bcrypt.hashSync('Pius-1234', 10), role: 'supervisor', capacity: 6, area: 'Web Development' },
  { id: 5, name: 'Dr. Nneka Obi', email: 'nneka@topicflow.test', password: bcrypt.hashSync('Pius-1234', 10), role: 'supervisor', capacity: 6, area: 'Cybersecurity' },
  { id: 6, name: 'Chiamaka Bello', email: 'chiamaka@topicflow.test', password: bcrypt.hashSync('Pius-1234', 10), role: 'student', capacity: 0, area: '' },
  { id: 7, name: 'Ifeanyi Okoro', email: 'ifeanyi@topicflow.test', password: bcrypt.hashSync('Pius-1234', 10), role: 'student', capacity: 0, area: '' }
];
const demoTopics = [
  { id: 1, title: 'AI-powered student performance prediction', area: 'Artificial Intelligence', supervisor_id: 2, status: 'available', created_at: '2026-07-28' },
  { id: 2, title: 'Secure e-voting system for student elections', area: 'Cybersecurity', supervisor_id: 5, status: 'available', created_at: '2026-07-27' },
  { id: 3, title: 'Online project topic allocation platform', area: 'Web Development', supervisor_id: 4, status: 'allocated', created_at: '2026-07-26' },
  { id: 4, title: 'Crop disease detection using image recognition', area: 'Artificial Intelligence', supervisor_id: 2, status: 'available', created_at: '2026-07-25' },
  { id: 5, title: 'Intelligent campus navigation with indoor mapping', area: 'Artificial Intelligence', supervisor_id: 2, status: 'review', created_at: '2026-07-24' },
  { id: 6, title: 'Data-driven library recommendation engine', area: 'Data Science', supervisor_id: 3, status: 'available', created_at: '2026-07-23' },
  { id: 7, title: 'Remote lab equipment scheduling dashboard', area: 'Web Development', supervisor_id: 4, status: 'review', created_at: '2026-07-22' },
  { id: 8, title: 'Privacy-first student credential wallet', area: 'Cybersecurity', supervisor_id: 5, status: 'allocated', created_at: '2026-07-21' },
  { id: 9, title: 'Adaptive exam scheduling and load balancing', area: 'Data Science', supervisor_id: 3, status: 'available', created_at: '2026-07-20' },
  { id: 10, title: 'Sensor-based campus energy monitoring system', area: 'Artificial Intelligence', supervisor_id: 2, status: 'available', created_at: '2026-07-19' },
  { id: 11, title: 'Collaborative research project tracker', area: 'Web Development', supervisor_id: 4, status: 'allocated', created_at: '2026-07-18' },
  { id: 12, title: 'Behavioral analytics for attendance trends', area: 'Cybersecurity', supervisor_id: 5, status: 'review', created_at: '2026-07-17' }
];
const demoRequests = [
  { id: 1, student_id: 6, student: 'Chiamaka Bello', title: 'Blockchain-based certificate verification', area: 'Cybersecurity', status: 'pending', created_at: '2026-07-29' },
  { id: 2, student_id: 7, student: 'Ifeanyi Okoro', title: 'Machine learning field study planner', area: 'Data Science', status: 'draft', created_at: '2026-07-28' }
];
const demoAllocations = [
  { id: 1, student_id: 6, topic_id: 3, supervisor_id: 4, allocated_at: '2026-07-30 10:00:00' },
  { id: 2, student_id: 7, topic_id: 8, supervisor_id: 5, allocated_at: '2026-07-29 11:20:00' },
  { id: 3, student_id: 7, topic_id: 11, supervisor_id: 4, allocated_at: '2026-07-28 14:15:00' }
];
const demoTopicScores = [
  { topic_id: 3, score: 4, note: 'Strong proposal and clear scope.', updated_at: '2026-07-30T10:10:00.000Z' },
  { topic_id: 8, score: 5, note: 'Excellent alignment with security practice.', updated_at: '2026-07-29T11:40:00.000Z' }
];

function loadPersistedDemoData() {
  try {
    if (!fs.existsSync(STORAGE_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (err) {
    console.warn('Could not read persisted data file:', err.message);
    return null;
  }
}

function persistDemoData() {
  try {
    fs.mkdirSync(path.dirname(STORAGE_FILE), { recursive: true });
    fs.writeFileSync(STORAGE_FILE, JSON.stringify({
      users: demoUsers,
      topics: demoTopics,
      requests: demoRequests,
      allocations: demoAllocations,
      topicScores: demoTopicScores
    }, null, 2));
    return true;
  } catch (err) {
    console.warn('Could not persist demo data:', err.message);
    return false;
  }
}

const persistedDemoData = loadPersistedDemoData();
if (persistedDemoData) {
  if (Array.isArray(persistedDemoData.users) && persistedDemoData.users.length) {
    demoUsers.splice(0, demoUsers.length, ...persistedDemoData.users);
  }
  if (Array.isArray(persistedDemoData.topics) && persistedDemoData.topics.length) {
    demoTopics.splice(0, demoTopics.length, ...persistedDemoData.topics);
  }
  if (Array.isArray(persistedDemoData.requests) && persistedDemoData.requests.length) {
    demoRequests.splice(0, demoRequests.length, ...persistedDemoData.requests);
  }
  if (Array.isArray(persistedDemoData.allocations) && persistedDemoData.allocations.length) {
    demoAllocations.splice(0, demoAllocations.length, ...persistedDemoData.allocations);
  }
  if (Array.isArray(persistedDemoData.topicScores) && persistedDemoData.topicScores.length) {
    demoTopicScores.splice(0, demoTopicScores.length, ...persistedDemoData.topicScores);
  }
}
persistDemoData();

function findDemoUserByEmail(email) {
  return demoUsers.find(user => String(user.email || '').toLowerCase() === String(email || '').toLowerCase());
}

function findDemoSupervisor(id) {
  return demoUsers.find(user => user.id === id && user.role === 'supervisor');
}

function demoUserCanReview(user, area) {
  return user && (user.role === 'admin' || (user.role === 'supervisor' && String(user.area).toLowerCase() === String(area).toLowerCase()));
}

function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

function demoSupervisorName(id) {
  return demoUsers.find(user => user.id === id && user.role === 'supervisor')?.name || null;
}

function demoTopicRows() {
  return demoTopics.map(topic => ({ ...topic, supervisor: demoSupervisorName(topic.supervisor_id) }));
}

function demoSupervisorsList() {
  return demoUsers.filter(user => user.role === 'supervisor').map(({ id, name, area, capacity }) => ({ id, name, area, capacity }));
}

function demoDashboardStats() {
  const total = demoUsers.filter(user => user.role === 'student').length;
  const allocated = demoAllocations.length;
  const available = demoTopics.filter(topic => topic.status === 'available').length;
  const pending = demoRequests.filter(request => request.status === 'pending').length;
  return { total, allocated, available, pending };
}

async function query(sql, params = []) {
  if (demoMode) return [];
  const db = await getPool();
  if (!db) return [];
  if (!db) return [];
  const [rows] = await db.query(sql, params);
  return rows;
}

async function demoApi(req, res, action) {
  const method = req.method.toUpperCase();
  const user = currentUser(req);
  const body = req.body || {};

  switch (action) {
    case 'register': {
      if (!requirePost(req, res)) return;
      if (!requireCsrf(req, res)) return;
      const userName = validText(body.name, 'Name', 2, 80);
      const userEmail = String(body.email || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail)) return sendError(res, 'Enter a valid email address');
      if (String(body.password || '').length < 6) return sendError(res, 'Password must be at least 6 characters');
      if (demoUsers.some(existing => existing.email === userEmail)) return sendError(res, 'An account with this email already exists', 409);
      const userRole = ['admin', 'supervisor', 'student'].includes(body.role) ? body.role : 'student';
      const id = nextId(demoUsers);
      const newUser = { id, name: userName, email: userEmail, password: bcrypt.hashSync(body.password, 10), role: userRole, capacity: userRole === 'supervisor' ? 6 : 0, area: '' };
      demoUsers.push(newUser);
      persistDemoData();
      req.session.regenerate(() => {
        req.session.user = sanitizeUser(newUser);
        res.json({ user: req.session.user, csrf: getCsrf(req) });
      });
      return;
    }
    case 'login': {
      if (!requirePost(req, res)) return;
      const userEmail = String(body.email || '').trim().toLowerCase();
      const found = demoUsers.find(u => u.email === userEmail);
      if (!found || !bcrypt.compareSync(String(body.password || ''), found.password)) return sendError(res, 'Invalid email or password', 422);
      req.session.regenerate(() => {
        req.session.user = sanitizeUser(found);
        res.json({ user: req.session.user, csrf: getCsrf(req) });
      });
      return;
    }
    case 'logout': {
      if (!requirePost(req, res)) return;
      if (!requireCsrf(req, res)) return;
      req.session.destroy(err => {
        if (err) return sendError(res, 'Could not log out', 500);
        res.json({ ok: true });
      });
      return;
    }
    case 'me': {
      return res.json({ user, csrf: user ? getCsrf(req) : null });
    }
    case 'supervisors': {
      if (!requireAuth(req, res)) return;
      return res.json(demoSupervisorsList());
    }
    case 'topics': {
      if (!requireAuth(req, res)) return;
      if (method === 'GET') return res.json(demoTopicRows());
      if (!requirePost(req, res)) return;
      if (!requireCsrf(req, res)) return;
      const topicTitle = validText(body.title, 'Title', 8);
      const topicArea = validText(body.area || 'General', 'Area', 2, 80);
      const supervisorId = user.role === 'supervisor' ? user.id : Number(body.supervisor_id || 0);
      if (!demoUsers.some(u => u.id === supervisorId && u.role === 'supervisor')) return sendError(res, 'Select a valid supervisor', 422);
      const id = nextId(demoTopics);
      demoTopics.unshift({ id, title: topicTitle, area: topicArea, supervisor_id: supervisorId, status: 'available', created_at: new Date().toISOString().slice(0, 10) });
      persistDemoData();
      return res.status(201).json({ id, message: 'Topic created' });
    }
    case 'requests': {
      if (!requireAuth(req, res)) return;
      if (method === 'GET') {
        let result = [...demoRequests];
        if (user.role === 'student') result = result.filter(r => r.student_id === user.id);
        else if (user.role === 'supervisor') result = result.filter(r => String(r.area).toLowerCase() === String(user.area).toLowerCase());
        return res.json(result);
      }
      if (!requirePost(req, res)) return;
      if (!requireCsrf(req, res)) return;
      if (user.role !== 'student') return sendError(res, 'Only students can submit requests', 403);
      const requestTitle = validText(body.title, 'Title', 8);
      const requestArea = validText(body.area || 'General', 'Area', 2, 80);
      const status = body.mode === 'draft' ? 'draft' : 'pending';
      if (status === 'pending' && demoRequests.some(r => r.student_id === user.id && r.status === 'pending')) return sendError(res, 'You already have a pending request', 409);
      const id = nextId(demoRequests);
      demoRequests.unshift({ id, student_id: user.id, student: user.name, title: requestTitle, area: requestArea, status, created_at: new Date().toISOString().slice(0, 10) });
      persistDemoData();
      return res.status(201).json({ id, status });
    }
    case 'review-request': {
      if (!requirePost(req, res)) return;
      if (!requireCsrf(req, res)) return;
      const reviewUser = requireAuth(req, res, ['admin', 'supervisor']);
      if (!reviewUser) return;
      const requestId = Number(body.id || 0);
      if (requestId < 1 || !['approved', 'rejected'].includes(body.decision)) return sendError(res, 'Invalid request review', 422);
      const requestItem = demoRequests.find(r => r.id === requestId && r.status === 'pending');
      if (!requestItem) return sendError(res, 'Request is unavailable', 404);
      if (!demoUserCanReview(reviewUser, requestItem.area)) return sendError(res, 'Forbidden', 403);
      requestItem.status = body.decision;
      persistDemoData();
      return res.json({ ok: true });
    }
    case 'allocate': {
      if (!requirePost(req, res)) return;
      if (!requireCsrf(req, res)) return;
      const allocationUser = requireAuth(req, res, ['admin', 'supervisor']);
      if (!allocationUser) return;
      const studentId = Number(body.student_id || 0);
      const topicId = Number(body.topic_id || 0);
      const student = demoUsers.find(u => u.id === studentId && u.role === 'student');
      if (!student) return sendError(res, 'Select a valid student', 422);
      const topic = demoTopics.find(t => t.id === topicId);
      if (!topic || topic.status !== 'available') return sendError(res, 'Topic is unavailable', 422);
      if (allocationUser.role === 'supervisor' && topic.supervisor_id !== allocationUser.id) return sendError(res, 'Forbidden', 403);
      const supervisor = demoUsers.find(u => u.id === topic.supervisor_id && u.role === 'supervisor');
      const currentLoad = demoAllocations.filter(a => a.supervisor_id === topic.supervisor_id).length;
      if (!supervisor || currentLoad >= supervisor.capacity) return sendError(res, 'Supervisor is at capacity', 422);
      demoAllocations.push({ id: nextId(demoAllocations), student_id: studentId, topic_id: topicId, supervisor_id: topic.supervisor_id, allocated_at: new Date().toISOString().slice(0, 19).replace('T', ' ') });
      topic.status = 'allocated';
      persistDemoData();
      return res.json({ ok: true });
    }
    case 'dashboard': {
      if (!requireAuth(req, res)) return;
      return res.json(demoDashboardStats());
    }
    case 'scores': {
      if (!requireAuth(req, res)) return;
      return res.json(demoTopicScores);
    }
    case 'score-topic': {
      if (!requirePost(req, res)) return;
      if (!requireCsrf(req, res)) return;
      const scoreUser = requireAuth(req, res, ['supervisor']);
      if (!scoreUser) return;
      const topicId = Number(body.topic_id || 0);
      const score = Number(body.score || 0);
      if (!topicId || score < 1 || score > 5) return sendError(res, 'Choose a score between 1 and 5', 422);
      const topic = demoTopics.find(item => item.id === topicId);
      if (!topic || topic.supervisor_id !== scoreUser.id) return sendError(res, 'Topic not assigned to you', 403);
      const existing = demoTopicScores.find(item => item.topic_id === topicId);
      if (existing) {
        existing.score = score;
        existing.note = String(body.note || '');
        existing.updated_at = new Date().toISOString();
      } else {
        demoTopicScores.push({ topic_id: topicId, score, note: String(body.note || ''), updated_at: new Date().toISOString() });
      }
      persistDemoData();
      return res.json({ ok: true });
    }
    case 'report': {
      if (!requireAuth(req, res, ['admin', 'supervisor'])) return;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="allocation-report.csv"');
      const rows = demoAllocations.map(allocation => {
        const student = demoUsers.find(u => u.id === allocation.student_id)?.name || 'Unknown';
        const topic = demoTopics.find(t => t.id === allocation.topic_id)?.title || 'Unknown';
        const supervisor = demoUsers.find(u => u.id === allocation.supervisor_id)?.name || 'Unknown';
        return { student, topic, supervisor, allocated_at: allocation.allocated_at };
      });
      const lines = ['Student,Topic,Supervisor,Allocated'];
      for (const row of rows) {
        const safe = value => String(value || '').replace(/^[=+\-@]/, "'${value}").replace(/"/g, '""');
        lines.push(`"${safe(row.student)}","${safe(row.topic)}","${safe(row.supervisor)}","${safe(row.allocated_at)}"`);
      }
      return res.send(lines.join('\n'));
    }
    default:
      return sendError(res, 'Unknown endpoint', 404);
  }
}

function sendError(res, message, status = 400) {
  if (res.headersSent) return res;
  return res.status(status).json({ error: message });
}

function currentUser(req) {
  return req.session.user || null;
}

function requirePost(req, res) {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405);
    return false;
  }
  return true;
}

function requireAuth(req, res, roles = ['admin', 'supervisor', 'student']) {
  const user = currentUser(req);
  if (!user || !roles.includes(user.role)) {
    sendError(res, 'Unauthorized', 401);
    return null;
  }
  return user;
}

function requireCsrf(req, res) {
  const token = req.headers['x-csrf-token'];
  if (!req.session.csrf || token !== req.session.csrf) {
    sendError(res, 'Invalid request token', 403);
    return false;
  }
  return true;
}

function getCsrf(req) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  return req.session.csrf;
}

function validText(value, field, min = 1, max = 180) {
  const text = String(value || '').trim();
  if (text.length < min || text.length > max) throw new Error(`${field} must be between ${min} and ${max} characters`);
  return text;
}

function canReview(user, area) {
  return user.role === 'admin' || (user.role === 'supervisor' && String(user.area).toLowerCase() === String(area).toLowerCase());
}

async function initDb() {
  const db = await getPool();
  if (!db) {
    console.warn('Demo mode enabled: skipping database initialization and using in-memory demo data');
    return;
  }

  await query(`CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role ENUM('admin', 'supervisor', 'student') NOT NULL,
    capacity INT DEFAULT 6,
    area TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await query(`CREATE TABLE IF NOT EXISTS topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title TEXT UNIQUE NOT NULL,
    area TEXT NOT NULL,
    supervisor_id INT,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await query(`CREATE TABLE IF NOT EXISTS requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title TEXT NOT NULL,
    area TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    reviewer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await query(`CREATE TABLE IF NOT EXISTS allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT UNIQUE NOT NULL,
    topic_id INT UNIQUE NOT NULL,
    supervisor_id INT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (supervisor_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  const existing = await query('SELECT COUNT(*) AS count FROM users');
  if (existing[0].count === 0) {
    const passwordHash = bcrypt.hashSync('Pius-1234', 10);
    const users = [
      ['Pius Tana', 'piusutana121@gmail.com', passwordHash, 'admin', 0, ''],
      ['Dr. Adaeze Okafor', 'adaeze@topicflow.test', passwordHash, 'supervisor', 6, 'Artificial Intelligence'],
      ['Prof. Ibrahim Musa', 'ibrahim@topicflow.test', passwordHash, 'supervisor', 6, 'Data Science'],
      ['Dr. Chinedu Eze', 'chinedu@topicflow.test', passwordHash, 'supervisor', 6, 'Web Development'],
      ['Dr. Nneka Obi', 'nneka@topicflow.test', passwordHash, 'supervisor', 6, 'Cybersecurity'],
      ['Chiamaka Bello', 'chiamaka@topicflow.test', passwordHash, 'student', 0, ''],
      ['Ifeanyi Okoro', 'ifeanyi@topicflow.test', passwordHash, 'student', 0, '']
    ];
    for (const user of users) {
      await query('INSERT INTO users (name, email, password, role, capacity, area) VALUES (?, ?, ?, ?, ?, ?)', user);
    }

    const topics = [
      ['AI-powered student performance prediction', 'Artificial Intelligence', 2, 'available'],
      ['Secure e-voting system for student elections', 'Cybersecurity', 5, 'available'],
      ['Online project topic allocation platform', 'Web Development', 4, 'allocated'],
      ['Crop disease detection using image recognition', 'Artificial Intelligence', 2, 'available'],
      ['Intelligent campus navigation with indoor mapping', 'Artificial Intelligence', 2, 'review'],
      ['Data-driven library recommendation engine', 'Data Science', 3, 'available'],
      ['Remote lab equipment scheduling dashboard', 'Web Development', 4, 'review'],
      ['Privacy-first student credential wallet', 'Cybersecurity', 5, 'allocated'],
      ['Adaptive exam scheduling and load balancing', 'Data Science', 3, 'available'],
      ['Sensor-based campus energy monitoring system', 'Artificial Intelligence', 2, 'available'],
      ['Collaborative research project tracker', 'Web Development', 4, 'allocated'],
      ['Behavioral analytics for attendance trends', 'Cybersecurity', 5, 'review']
    ];
    for (const topic of topics) {
      await query('INSERT INTO topics (title, area, supervisor_id, status) VALUES (?, ?, ?, ?)', topic);
    }

    await query('INSERT INTO requests (student_id, title, area, status) VALUES (?, ?, ?, ?)', [6, 'Blockchain-based certificate verification', 'Cybersecurity', 'pending']);
    await query('INSERT INTO requests (student_id, title, area, status) VALUES (?, ?, ?, ?)', [7, 'Machine learning field study planner', 'Data Science', 'draft']);

    const allocatedTopics = await query('SELECT id FROM topics WHERE status = ? LIMIT 3', ['allocated']);
    const students = [6, 7];
    for (let i = 0; i < students.length; i += 1) {
      const topic = allocatedTopics[i];
      if (!topic) break;
      const topicInfo = await query('SELECT supervisor_id FROM topics WHERE id = ?', [topic.id]);
      await query('INSERT IGNORE INTO allocations (student_id, topic_id, supervisor_id) VALUES (?, ?, ?)', [students[i], topic.id, topicInfo[0].supervisor_id]);
    }
  }
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

app.all('/api', async (req, res) => {
  const action = String(req.query.action || '').trim();
  try {
    if (demoMode) return demoApi(req, res, action);
    switch (action) {
      case 'register': {
        if (!requirePost(req, res)) return;
        if (!requireCsrf(req, res)) return;
        const { name, email, password, role } = req.body;
        const userName = validText(name, 'Name', 2, 80);
        const userEmail = String(email || '').trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail)) throw new Error('Enter a valid email address');
        if (String(password || '').length < 6) throw new Error('Password must be at least 6 characters');
        const userRole = ['admin', 'supervisor', 'student'].includes(role) ? role : 'student';
        const existing = await query('SELECT id FROM users WHERE email = ?', [userEmail]);
        if (existing.length) return sendError(res, 'An account with this email already exists', 409);
        const hash = bcrypt.hashSync(password, 10);
        await query('INSERT INTO users (name, email, password, role, capacity, area) VALUES (?, ?, ?, ?, ?, ?)', [userName, userEmail, hash, userRole, userRole === 'supervisor' ? 6 : 0, '']);
        const [user] = await query('SELECT id, name, email, role, area FROM users WHERE email = ?', [userEmail]);
        req.session.regenerate(() => {
          req.session.user = sanitizeUser(user);
          res.json({ user: req.session.user, csrf: getCsrf(req) });
        });
        return;
      }
      case 'login': {
        if (!requirePost(req, res)) return;
        const { email, password } = req.body;
        const userEmail = String(email || '').trim().toLowerCase();
        const [user] = await query('SELECT id, name, email, password, role, area FROM users WHERE email = ?', [userEmail]);
        if (!user || !bcrypt.compareSync(String(password || ''), user.password)) return sendError(res, 'Invalid email or password', 422);
        req.session.regenerate(() => {
          delete user.password;
          req.session.user = sanitizeUser(user);
          res.json({ user: req.session.user, csrf: getCsrf(req) });
        });
        return;
      }
      case 'logout': {
        if (!requirePost(req, res)) return;
        if (!requireCsrf(req, res)) return;
        req.session.destroy(err => {
          if (err) return sendError(res, 'Could not log out', 500);
          res.json({ ok: true });
        });
        return;
      }
      case 'me': {
        const user = currentUser(req);
        res.json({ user, csrf: user ? getCsrf(req) : null });
        return;
      }
      case 'supervisors': {
        if (!requireAuth(req, res)) return;
        const rows = await query('SELECT id, name, area, capacity FROM users WHERE role = ? ORDER BY name', ['supervisor']);
        res.json(rows);
        return;
      }
      case 'topics': {
        const user = requireAuth(req, res);
        if (!user) return;
        if (req.method === 'GET') {
          const rows = await query('SELECT t.*, u.name AS supervisor FROM topics t LEFT JOIN users u ON u.id = t.supervisor_id ORDER BY t.created_at DESC');
          return res.json(rows);
        }
        if (!requirePost(req, res)) return;
        if (!requireCsrf(req, res)) return;
        const { title, area, supervisor_id } = req.body;
        const topicTitle = validText(title, 'Title', 8);
        const topicArea = validText(area || 'General', 'Area', 2, 80);
        const duplicate = await query('SELECT id, title FROM topics WHERE LOWER(title) LIKE ? LIMIT 1', [`%${topicTitle.toLowerCase().split(' ').filter(w => w.length > 4).join('%')}%`]);
        if (duplicate.length) return sendError(res, 'Possible duplicate', 409);
        const supervisorId = user.role === 'supervisor' ? user.id : Number(supervisor_id || 0);
        const [supervisor] = await query('SELECT id FROM users WHERE id = ? AND role = ?', [supervisorId, 'supervisor']);
        if (!supervisor) return sendError(res, 'Select a valid supervisor', 422);
        const result = await query('INSERT INTO topics (title, area, supervisor_id) VALUES (?, ?, ?)', [topicTitle, topicArea, supervisorId]);
        return res.status(201).json({ id: result.insertId, message: 'Topic created' });
      }
      case 'requests': {
        const user = requireAuth(req, res);
        if (!user) return;
        if (req.method === 'GET') {
          let sql = 'SELECT r.*, u.name AS student FROM requests r JOIN users u ON u.id = r.student_id';
          const params = [];
          if (user.role === 'student') {
            sql += ' WHERE r.student_id = ?';
            params.push(user.id);
          } else if (user.role === 'supervisor') {
            sql += ' WHERE LOWER(r.area) = LOWER(?)';
            params.push(user.area);
          }
          sql += ' ORDER BY r.created_at DESC';
          const rows = await query(sql, params);
          return res.json(rows);
        }
        if (!requirePost(req, res)) return;
        if (!requireCsrf(req, res)) return;
        if (user.role !== 'student') return sendError(res, 'Only students can submit requests', 403);
        const { title, area, mode } = req.body;
        const requestTitle = validText(title, 'Title', 8);
        const requestArea = validText(area || 'General', 'Area', 2, 80);
        const status = mode === 'draft' ? 'draft' : 'pending';
        if (status === 'pending') {
          const pendingCount = await query('SELECT COUNT(*) AS count FROM requests WHERE student_id = ? AND status = ?', [user.id, 'pending']);
          if (pendingCount[0].count > 0) return sendError(res, 'You already have a pending request', 409);
        }
        const result = await query('INSERT INTO requests (student_id, title, area, status) VALUES (?, ?, ?, ?)', [user.id, requestTitle, requestArea, status]);
        return res.status(201).json({ id: result.insertId, status });
      }
      case 'review-request': {
        if (!requirePost(req, res)) return;
        if (!requireCsrf(req, res)) return;
        const user = requireAuth(req, res, ['admin', 'supervisor']);
        if (!user) return;
        const { id, decision } = req.body;
        const requestId = Number(id || 0);
        if (requestId < 1 || !['approved', 'rejected'].includes(decision)) return sendError(res, 'Invalid request review', 422);
        const [request] = await query('SELECT id, area, status FROM requests WHERE id = ? AND status = ?', [requestId, 'pending']);
        if (!request) return sendError(res, 'Request is unavailable', 404);
        if (!canReview(user, request.area)) return sendError(res, 'Forbidden', 403);
        await query('UPDATE requests SET status = ?, reviewer_id = ? WHERE id = ?', [decision, user.id, requestId]);
        return res.json({ ok: true });
      }
      case 'allocate': {
        if (!requirePost(req, res)) return;
        if (!requireCsrf(req, res)) return;
        const user = requireAuth(req, res, ['admin', 'supervisor']);
        if (!user) return;
        const studentId = Number(req.body.student_id || 0);
        const topicId = Number(req.body.topic_id || 0);
        const [student] = await query('SELECT id FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
        if (!student) return sendError(res, 'Select a valid student', 422);
        const [topic] = await query('SELECT supervisor_id, status FROM topics WHERE id = ?', [topicId]);
        if (!topic || topic.status !== 'available') return sendError(res, 'Topic is unavailable', 422);
        if (user.role === 'supervisor' && topic.supervisor_id !== user.id) return sendError(res, 'Forbidden', 403);
        const [capacityRow] = await query('SELECT capacity FROM users WHERE id = ?', [topic.supervisor_id]);
        const [loadRow] = await query('SELECT COUNT(*) AS count FROM allocations WHERE supervisor_id = ?', [topic.supervisor_id]);
        if (!capacityRow || loadRow.count >= capacityRow.capacity) return sendError(res, 'Supervisor is at capacity', 422);
        await query('INSERT INTO allocations (student_id, topic_id, supervisor_id) VALUES (?, ?, ?)', [studentId, topicId, topic.supervisor_id]);
        await query('UPDATE topics SET status = ? WHERE id = ?', ['allocated', topicId]);
        return res.json({ ok: true });
      }
      case 'dashboard': {
        if (!requireAuth(req, res)) return;
        const [totalRow] = await query('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['student']);
        const [allocatedRow] = await query('SELECT COUNT(*) AS count FROM allocations');
        const [availableRow] = await query('SELECT COUNT(*) AS count FROM topics WHERE status = ?', ['available']);
        const [pendingRow] = await query('SELECT COUNT(*) AS count FROM requests WHERE status = ?', ['pending']);
        return res.json({ total: totalRow.count, allocated: allocatedRow.count, available: availableRow.count, pending: pendingRow.count });
      }
      case 'scores': {
        if (!requireAuth(req, res)) return;
        const rows = await query('SELECT topic_id, score, note, updated_at FROM topic_scores ORDER BY updated_at DESC');
        return res.json(rows);
      }
      case 'score-topic': {
        if (!requirePost(req, res)) return;
        if (!requireCsrf(req, res)) return;
        const user = requireAuth(req, res, ['supervisor']);
        if (!user) return;
        const { topic_id: topicId, score, note } = req.body;
        const normalizedScore = Number(score || 0);
        if (!Number(topicId || 0) || normalizedScore < 1 || normalizedScore > 5) return sendError(res, 'Choose a score between 1 and 5', 422);
        const [topic] = await query('SELECT id, supervisor_id FROM topics WHERE id = ?', [Number(topicId)]);
        if (!topic || topic.supervisor_id !== user.id) return sendError(res, 'Topic not assigned to you', 403);
        const [existing] = await query('SELECT id FROM topic_scores WHERE topic_id = ?', [topic.id]);
        if (existing) {
          await query('UPDATE topic_scores SET score = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE topic_id = ?', [normalizedScore, String(note || ''), topic.id]);
        } else {
          await query('INSERT INTO topic_scores (topic_id, score, note, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [topic.id, normalizedScore, String(note || '')]);
        }
        return res.json({ ok: true });
      }
      case 'report': {
        const user = requireAuth(req, res, ['admin', 'supervisor']);
        if (!user) return;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="allocation-report.csv"');
        const rows = await query('SELECT s.name AS student, t.title AS topic, u.name AS supervisor, a.allocated_at FROM allocations a JOIN users s ON s.id = a.student_id JOIN topics t ON t.id = a.topic_id JOIN users u ON u.id = a.supervisor_id');
        const lines = ['Student,Topic,Supervisor,Allocated'];
        for (const row of rows) {
          const safe = value => String(value || '').replace(/^[=+\-@]/, "'$&").replace(/"/g, '""');
          lines.push(`"${safe(row.student)}","${safe(row.topic)}","${safe(row.supervisor)}","${safe(row.allocated_at)}"`);
        }
        return res.send(lines.join('\n'));
      }
      default:
        return sendError(res, 'Unknown endpoint', 404);
    }
  } catch (error) {
    return sendError(res, error.message || 'Server error', 400);
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`TopicFlow Node API is running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Unable to start server:', err);
  process.exit(1);
});
