const TELEGRAM_TOKEN   = process.env.TELEGRAM_TOKEN   || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, error: "text required" });

  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ ok: false, error: "Telegram not configured" });
  }

  const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  });

  const data = await resp.json();
  if (!data.ok) return res.status(500).json({ ok: false, error: data.description });
  res.json({ ok: true });
}
