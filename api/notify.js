import nodemailer from "nodemailer";

const RELAY_SECRET = process.env.RELAY_SECRET || "";
const MAIL_USER    = process.env.MAIL_USER    || "";
const MAIL_PASS    = process.env.MAIL_PASS    || "";
const MAIL_TO      = process.env.MAIL_TO      || MAIL_USER;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  if (RELAY_SECRET && req.headers["x-relay-secret"] !== RELAY_SECRET) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  const { subject, text } = req.body || {};
  if (!subject || !text) return res.status(400).json({ ok: false, error: "subject and text required" });

  const mailer = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  });

  try {
    await mailer.sendMail({
      from: `"Столица Земли" <${MAIL_USER}>`,
      to: MAIL_TO,
      subject,
      text,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
}
