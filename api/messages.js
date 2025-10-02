import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const messages = (await kv.get("messages")) || [];
    res.json(messages);
  } 
  else if (req.method === "POST") {
    const { user, text } = req.body;
    let messages = (await kv.get("messages")) || [];
    messages.push({ user, text, time: Date.now() });
    if (messages.length > 50) messages = messages.slice(-50); // simpan max 50 pesan
    await kv.set("messages", messages);
    res.json({ ok: true });
  } 
  else {
    res.status(405).end();
  }
}
