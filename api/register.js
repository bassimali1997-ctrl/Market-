// api/register.js
const bcrypt = require('bcryptjs');
const supabase = require('./_supabase');
const { signToken, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, store_name, username, password } = req.body || {};

  if (!name || !store_name || !username || !password)
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });

  if (password.length < 6)
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });

  // Check existing username
  const { data: existing } = await supabase
    .from('users').select('id').eq('username', username).single();
  if (existing) return res.status(409).json({ error: 'اسم المستخدم مستخدم بالفعل' });

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, store_name, username, password_hash })
    .select('id, name, store_name, username')
    .single();

  if (error) return res.status(500).json({ error: 'خطأ في إنشاء الحساب' });

  const token = signToken({ id: user.id, username: user.username });
  return res.status(200).json({ token, user });
};
