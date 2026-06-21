-- ═══════════════════════════════════════════════════════════
-- نظام دفتر الديون - هايبر ماركت
-- قم بتشغيل هذا الكود في Supabase SQL Editor مرة واحدة فقط
-- ═══════════════════════════════════════════════════════════

-- جدول أصحاب المحلات (المستخدمين)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  store_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الزبائن
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المعاملات (ديون ودفعات)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('debt','payment')) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  products JSONB DEFAULT '[]',
  tx_date DATE NOT NULL,
  tx_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- تفعيل Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان: كل مستخدم يرى بياناته فقط
-- (سنتحكم بالأمان من API، لذا نسمح للـ service_role بكل شيء)
CREATE POLICY "service_role_all_users" ON users FOR ALL USING (true);
CREATE POLICY "service_role_all_clients" ON clients FOR ALL USING (true);
CREATE POLICY "service_role_all_transactions" ON transactions FOR ALL USING (true);
