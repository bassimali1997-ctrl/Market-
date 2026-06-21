// api/transactions.js
const supabase = require('./_supabase');
const { verifyToken, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح' });

  // GET transactions for a client
  if (req.method === 'GET') {
    const client_id = req.query.client_id;
    if (!client_id) return res.status(400).json({ error: 'client_id مطلوب' });
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('client_id', client_id)
      .eq('user_id', user.id)
      .order('tx_date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST create transaction
  if (req.method === 'POST') {
    const { client_id, type, amount, products, tx_date, tx_time, notes } = req.body || {};
    if (!client_id || !type || !amount || !tx_date)
      return res.status(400).json({ error: 'الحقول الأساسية مطلوبة' });
    const { data, error } = await supabase
      .from('transactions')
      .insert({ client_id, user_id: user.id, type, amount, products: products || [], tx_date, tx_time, notes })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // DELETE transaction
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id مطلوب' });
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id).eq('user_id', user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
