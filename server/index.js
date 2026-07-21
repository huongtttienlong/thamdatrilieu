require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const store = require('./store');
const { notifyNewLead } = require('./notify');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'doi-mat-khau-nay';
const SESSION_SECRET = process.env.SESSION_SECRET || 'doi-chuoi-nay-thanh-ngau-nhien-dai';

app.disable('x-powered-by');
app.use(express.json());
app.use(
  session({
    name: 'tdtl_admin_sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 },
  })
);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// --- Public site (khong dung express.static cho /admin de kiem soat auth) ---
app.use(
  express.static(PUBLIC_DIR, {
    index: 'index.html',
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}admin${path.sep}`)) {
        res.setHeader('Cache-Control', 'no-store');
      }
    },
  })
);

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim();
  return req.socket.remoteAddress || '';
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + SESSION_SECRET).digest('hex').slice(0, 16);
}

function detectDevice(ua) {
  if (!ua) return 'unknown';
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

// --- API: ghi nhan luot truy cap ---
app.post('/api/track', (req, res) => {
  const { page, referrer } = req.body || {};
  const ua = req.headers['user-agent'] || '';
  Promise.resolve(
    store.addVisit({
      ts: new Date().toISOString(),
      page: typeof page === 'string' ? page.slice(0, 200) : '/',
      referrer: typeof referrer === 'string' ? referrer.slice(0, 300) : '',
      device: detectDevice(ua),
      ipHash: hashIp(getClientIp(req)),
    })
  ).catch(() => {});
  res.status(204).end();
});

// --- API: khach de lai thong tin (lead) ---
function isValidPhone(phone) {
  return /^[0-9+][0-9 .-]{7,14}$/.test(String(phone || '').trim());
}

app.post('/api/leads', async (req, res) => {
  const { name, phone, note, source } = req.body || {};
  const cleanName = String(name || '').trim().slice(0, 120);
  const cleanPhone = String(phone || '').trim().slice(0, 20);

  if (!cleanName || cleanName.length < 2) {
    return res.status(400).json({ ok: false, error: 'Vui long nhap ho ten hop le.' });
  }
  if (!isValidPhone(cleanPhone)) {
    return res.status(400).json({ ok: false, error: 'Vui long nhap so dien thoai hop le.' });
  }

  try {
    const lead = await store.addLead({
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      name: cleanName,
      phone: cleanPhone,
      note: String(note || '').trim().slice(0, 500),
      source: String(source || '').trim().slice(0, 100),
    });

    // Gửi email thông báo (không chặn phản hồi cho khách)
    notifyNewLead(lead).catch(() => {});

    res.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error('Lỗi lưu lead:', err.message);
    res.status(500).json({ ok: false, error: 'Co loi xay ra, vui long thu lai.' });
  }
});

// --- Admin auth ---
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ ok: false, error: 'Chua dang nhap.' });
  }
  return res.redirect('/admin/login.html');
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Sai mat khau.' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/admin', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
  }
  return res.redirect('/admin/login.html');
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const [visits, leads] = await Promise.all([store.getVisits(), store.getLeads()]);

  const byDay = {};
  for (const v of visits) {
    const day = v.ts.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }
  const last14 = Object.keys(byDay)
    .sort()
    .slice(-14)
    .map((day) => ({ day, count: byDay[day] }));

  const today = new Date().toISOString().slice(0, 10);

  res.json({
    ok: true,
    totalVisits: visits.length,
    visitsToday: byDay[today] || 0,
    totalLeads: leads.length,
    conversionRate: visits.length ? Number(((leads.length / visits.length) * 100).toFixed(2)) : 0,
    visitsByDay: last14,
    leads: [...leads].sort((a, b) => (a.ts < b.ts ? 1 : -1)),
  });
});

app.get('/api/admin/leads.csv', requireAdmin, async (req, res) => {
  const leads = await store.getLeads();
  const header = 'Thoi gian,Ho ten,So dien thoai,Ghi chu,Nguon\n';
  const rows = leads
    .map((l) =>
      [l.ts, l.name, l.phone, l.note, l.source]
        .map((v) => `"${String(v || '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="khach-hang-thamdatrilieu.csv"');
  res.send('﻿' + header + rows);
});

app.listen(PORT, () => {
  console.log(`Thảm Đa Trị Liệu landing page đang chạy tại http://localhost:${PORT}`);
});
