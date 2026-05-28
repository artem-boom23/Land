import express from "express";
import cors from "cors";
import fs from "fs/promises";
import fssync from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import { randomUUID } from "crypto";
import fetch from "node-fetch";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEADS_PATH = path.join(__dirname, "leads-store.json");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ====== Раздаём public ======
app.use(express.static(path.join(__dirname, "../public")));

// ====== Настройки ======
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@site.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const JWT_SECRET     = process.env.JWT_SECRET     || "dev_secret";
const JWT_EXPIRES    = process.env.JWT_EXPIRES    || "7d";

const RELAY_URL    = process.env.RELAY_URL    || "https://stolitsa-zemli.ru/api/notify";
const RELAY_SECRET = process.env.RELAY_SECRET || "";

// ===== Утилиты =====
function getPlotsPath(category) {
  switch (category) {
    case "izhs":
      return path.join(__dirname, "../public/plots-izhs.json");
    case "invest":
      return path.join(__dirname, "../public/plots-invest.json");
    case "industrial":
    default:
      return path.join(__dirname, "../public/plots.json");
  }
}

function readJSONSafe(file, fallback = []) {
  try {
    const raw = fssync.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJSONSafe(file, data) {
  try {
    fssync.writeFileSync(
      file,
      JSON.stringify(Array.isArray(data) ? data : [], null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("❌ Ошибка записи JSON:", err.message);
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ====== Уведомление через Vercel relay → Telegram ======
async function sendEmail(text) {
  const res = await fetch(RELAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Relay ${res.status}: ${err}`);
  }
}

// ====== Публичный API (карта) ======
app.get("/api/plots", (req, res) => {
  const { category = "industrial" } = req.query;
  const filePath = getPlotsPath(category);
  const plots = readJSONSafe(filePath, []);
  res.json({ items: plots });
});

// ====== Админка: участки ======
app.get("/api/admin/plots", authMiddleware, (req, res) => {
  const { category = "industrial" } = req.query;
  const filePath = getPlotsPath(category);
  const plots = readJSONSafe(filePath, []);
  res.json({ items: plots });
});

app.put("/api/admin/plots/:id", authMiddleware, (req, res) => {
  const { category = "industrial" } = req.query;
  const filePath = getPlotsPath(category);
  const { id } = req.params;
  const updates = req.body || {};

  const plots = readJSONSafe(filePath, []);
  const i = plots.findIndex((p) => String(p.id) === String(id));
  if (i === -1) return res.status(404).json({ error: "plot not found" });

  plots[i] = { ...plots[i], ...updates };
  writeJSONSafe(filePath, plots);

  res.json({ ok: true, item: plots[i] });
});

app.post("/api/admin/plots", authMiddleware, (req, res) => {
  const { category = "industrial" } = req.query;
  const filePath = getPlotsPath(category);
  const payload = req.body || {};
  if (!payload.id) payload.id = randomUUID();

  const plots = readJSONSafe(filePath, []);
  plots.push(payload);
  writeJSONSafe(filePath, plots);

  res.json({ ok: true, item: payload });
});

// УДАЛЕНИЕ УЧАСТКА
// DELETE /api/admin/plots/:id?category=industrial|izhs|invest
app.delete("/api/admin/plots/:id", authMiddleware, (req, res) => {
  const { category = "industrial" } = req.query;
  const filePath = getPlotsPath(category);
  const { id } = req.params;

  const plots = readJSONSafe(filePath, []);
  const idx = plots.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) {
    return res.status(404).json({ error: "plot not found" });
  }

  const removed = plots.splice(idx, 1)[0];
  writeJSONSafe(filePath, plots);

  res.json({ ok: true, id, removed });
});


// ====== Приём форм ======
app.post("/api/send-form", async (req, res) => {
  const { name = "", phone = "", email = "", message = "", source = "", plotId = "" } = req.body || {};
  if (!name || !phone) return res.status(400).json({ success: false, error: "name и phone обязательны" });

  const lead = {
    id: randomUUID(),
    name,
    phone,
    email,
    message,
    source,
    plotId,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  // Сохраняем заявку сразу — независимо от Telegram
  const leads = readJSONSafe(LEADS_PATH, []);
  leads.unshift(lead);
  writeJSONSafe(LEADS_PATH, leads);

  res.json({ success: true });

  // Telegram через Vercel relay — асинхронно, не блокируем ответ
  const tgText = `📩 Новая заявка
━━━━━━━━━━━━━━━━━━━
👤 Имя: ${name}
📱 Телефон: ${phone}
📧 Email: ${email || "—"}
📝 Сообщение: ${message || "—"}
🧭 Участок: ${plotId || "—"}
🌐 Источник: ${source}`;

  sendEmail(tgText).catch(err =>
    console.error("❌ Уведомление не отправлено (заявка сохранена):", err.message)
  );
});

// ====== Админка: логин + заявки ======
function handleAdminLogin(req, res) {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = signToken({ sub: "admin", email });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Invalid login or password" });
}
app.post("/api/admin/login", handleAdminLogin);
app.post("/api/admin-login", handleAdminLogin);

app.get("/api/admin/requests", authMiddleware, (req, res) => {
  const leads = readJSONSafe(LEADS_PATH, []);
  res.json({ items: leads });
});

app.patch("/api/admin/requests/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const leads = readJSONSafe(LEADS_PATH, []);
  const i = leads.findIndex((l) => l.id === id);
  if (i === -1) return res.status(404).json({ error: "not found" });
  leads[i].status = status || leads[i].status;
  writeJSONSafe(LEADS_PATH, leads);
  res.json({ ok: true, item: leads[i] });
});

// ====== START ======
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
