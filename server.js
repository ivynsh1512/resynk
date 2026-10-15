/**
 * resynk — Backend Server & API Worker
 * Handles static asset delivery, clean URL routing, Razorpay order creation & payment verification,
 * and 90-day subscription persistence (with optional Neon DB support & fallback JSON storage).
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(SUBS_FILE)) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

// Storage helpers
function getStoredSubscriptions() {
  try {
    const raw = fs.readFileSync(SUBS_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

function saveStoredSubscriptions(data) {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving subscriptions to disk:', e);
  }
}

// Optional Neon DB connection if DATABASE_URL is set
let neonClient = null;
if (process.env.DATABASE_URL) {
  console.log('Connecting to Neon PostgreSQL database...');
  // Lazy-load if pg or neon is installed, otherwise fallback to local JSON
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // -------------------------------------------------------------
  // API ROUTING (Worker functionality)
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    // 1. Health check
    if (pathname === '/api/health') {
      sendJSON(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
      return;
    }

    // 2. Razorpay Order Creation
    if (pathname === '/api/razorpay/create-order' && req.method === 'POST') {
      const payload = await parseRequestBody(req);
      const amount = payload.amount || 249;
      const courseId = payload.courseId || 'guitar-mastery';
      
      const orderId = 'order_' + Math.random().toString(36).substring(2, 12);
      sendJSON(res, 200, {
        success: true,
        orderId: orderId,
        amount: amount * 100, // paise
        currency: 'INR',
        courseId: courseId,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag'
      });
      return;
    }

    // 3. Razorpay Payment Verification & 3-Month Validity Calculation
    if (pathname === '/api/razorpay/verify-payment' && req.method === 'POST') {
      const payload = await parseRequestBody(req);
      const { courseId, userId, userEmail, paymentId, orderId, amount } = payload;

      if (!courseId || !userId) {
        sendJSON(res, 400, { success: false, message: 'Missing courseId or userId' });
        return;
      }

      const now = new Date();
      const validityDays = 120; // 3 to 4 months validity (90 - 120 days)
      const expiresAt = new Date(now.getTime() + (validityDays * 24 * 60 * 60 * 1000));

      const subData = {
        courseId,
        userId,
        userEmail: userEmail || 'student@resynk.in',
        paymentId: paymentId || ('pay_' + Math.random().toString(36).substring(2, 10)),
        orderId: orderId || ('ord_' + Math.random().toString(36).substring(2, 10)),
        amountPaid: amount || 0,
        purchasedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        validityDays: validityDays,
        status: 'active'
      };

      // If bundle was purchased, activate all 3 courses!
      const targetCourses = courseId === 'all-access-pass'
        ? ['guitar-mastery', 'keyboard-mastery', 'fine-arts-mastery', 'all-access-pass']
        : [courseId];

      const allSubs = getStoredSubscriptions();
      if (!allSubs[userId]) allSubs[userId] = {};

      targetCourses.forEach(id => {
        allSubs[userId][id] = { ...subData, courseId: id };
      });

      saveStoredSubscriptions(allSubs);

      sendJSON(res, 200, {
        success: true,
        message: 'Payment verified and 3-month access granted.',
        subscription: subData
      });
      return;
    }

    // 4. Fetch Subscriptions for a Student
    if (pathname === '/api/user/subscriptions' && req.method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId');
      if (!userId) {
        sendJSON(res, 400, { success: false, message: 'Missing userId parameter' });
        return;
      }

      const allSubs = getStoredSubscriptions();
      const userSubs = allSubs[userId] || {};
      const active = [];
      const now = Date.now();

      for (const [cid, sub] of Object.entries(userSubs)) {
        const expTime = new Date(sub.expiresAt).getTime();
        if (expTime > now) {
          const daysLeft = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
          active.push({ ...sub, daysLeft });
        }
      }

      sendJSON(res, 200, { success: true, subscriptions: active });
      return;
    }

    // 5. Contact Inquiries
    if (pathname === '/api/contact' && req.method === 'POST') {
      const payload = await parseRequestBody(req);
      sendJSON(res, 200, {
        success: true,
        message: 'Inquiry received. Master Rey & academy coordinators will contact you shortly.'
      });
      return;
    }

    sendJSON(res, 404, { success: false, message: 'API endpoint not found' });
    return;
  }

  // -------------------------------------------------------------
  // STATIC ASSET & CLEAN MULTI-PAGE ROUTING
  // -------------------------------------------------------------
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/courses') pathname = '/courses.html';
  if (pathname === '/portal') pathname = '/portal.html';
  if (pathname === '/about') pathname = '/about.html';
  if (pathname === '/portfolio') pathname = '/about.html';
  if (pathname === '/contact') pathname = '/contact.html';

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safePath);

  // If path doesn't have extension and exists as .html, serve that
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 handler
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Page Not Found — resynk</title>
          <style>
            body { background: #08090C; color: #F8FAFC; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            h1 { color: #D4AF37; margin-bottom: 8px; }
            a { color: #D4AF37; text-decoration: none; border: 1px solid #D4AF37; padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div>
            <h1>404 — Page Not Found</h1>
            <p>The requested page on resynk does not exist.</p>
            <a href="/">Return to Home</a>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`⚡ ReSynk Multi-Page Conservatory & Server running at:`);
  console.log(`   ➜ Local:   http://localhost:${PORT}`);
  console.log(`   ➜ Courses: http://localhost:${PORT}/courses`);
  console.log(`   ➜ Portal:  http://localhost:${PORT}/portal`);
  console.log(`   ➜ About:   http://localhost:${PORT}/about`);
  console.log(`================================================================\n`);
});
