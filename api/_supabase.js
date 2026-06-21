// api/_supabase.js - مشترك بين جميع API endpoints
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service_role key (سري - في Vercel env vars فقط)
);

module.exports = supabase;
