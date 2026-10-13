-- resynk Cloudflare D1 Database Schema

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount_paid INTEGER NOT NULL,
  purchased_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  validity_days INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_course ON subscriptions(course_id);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  discipline TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL
);
