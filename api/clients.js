// api/clients.js
const supabase = require('./_supabase');
const { verifyToken, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح' });

  // GET all clients
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST create client
  if (req.method === 'POST') {
    const { name, phone, notes } = req.body || {};
    if (!name) return res.status(400).json({ error: 'اسم الزبون مطلوب' });
    const { data, error } = await supabase
      .from('clients')
      .insert({ user_id: user.id, name, phone, notes })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // PUT update client
  if (req.method === 'PUT') {
    const { id, name, phone, notes } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id مطلوب' });
    const { data, error } = await supabase
      .from('clients')
      .update({ name, phone, notes })
      .eq('id', id).eq('user_id', user.id)
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // DELETE client
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id مطلوب' });
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id).eq('user_id', user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
