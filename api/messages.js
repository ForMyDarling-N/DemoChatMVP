import { getDB } from '../db/index.js';

export default async function handler(req, res) {
  const db = getDB();

  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT * FROM messages ORDER BY id DESC LIMIT 50');
    res.status(200).json(rows);
  } 
  else if (req.method === 'POST') {
    const { msg, user } = req.body;
    if (!msg) return res.status(400).json({ error: "Message required" });

    await db.query(
      'INSERT INTO messages (user_name, message) VALUES ($1, $2)',
      [user || 'Anon', msg]
    );

    res.status(200).json({ ok: true });
  } 
  else {
    res.status(405).end();
  }
      }
