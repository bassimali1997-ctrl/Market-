// api/login.js
const bcrypt = require('bcryptjs');
const supabase = require('./_supabase');
const { signToken, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: 'أدخل اسم المستخدم وكلمة المرور' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (!user || error)
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غلط' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غلط' });

  const token = signToken({ id: user.id, username: user.username });
  return res.status(200).json({
    token,
    user: { id: user.id, name: user.name, store_name: user.store_name, username: user.username }
  });
};
