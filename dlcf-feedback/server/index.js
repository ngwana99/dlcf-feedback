const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'feedback-data.json');

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/api/feedback', (req, res) => {
  try {
    const entry = {
      id: Date.now().toString(),
      ...req.body,
      receivedAt: new Date().toISOString()
    };

    const all = loadData();
    all.push(entry);
    saveData(all);

    console.log(`[${entry.receivedAt}] Feedback received — Day: ${entry.conferenceDay}, Anonymous: ${entry.anonymous}`);
    res.status(201).json({ success: true, message: 'Feedback saved.' });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

app.get('/api/feedback', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const all = loadData();
  res.json({ count: all.length, entries: all });
});

app.get('/api/summary', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const all = loadData();
  const byDay = {};
  let totalRating = 0, ratingCount = 0;
  const decisions = {};
  const sessions = {};

  for (const e of all) {
    byDay[e.conferenceDay] = (byDay[e.conferenceDay] || 0) + 1;
    if (e.overallRating) { totalRating += Number(e.overallRating); ratingCount++; }
    (e.decisions || []).forEach(d => { decisions[d] = (decisions[d]||0)+1; });
    (e.sessions || []).forEach(s => { sessions[s] = (sessions[s]||0)+1; });
  }

  res.json({
    total: all.length,
    byDay,
    avgRating: ratingCount ? (totalRating/ratingCount).toFixed(2) : null,
    decisions,
    sessions
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`DLCF Feedback server running on port ${PORT}`);
});
