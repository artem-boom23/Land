import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // В Node 18+ можно убрать
import fs from "fs/promises";
import fssync from "fs"; // sync JSON
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import { randomUUID } from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_PATH = path.join(__dirname, "chat-store.json");
const LEADS_PATH = path.join(__dirname, "leads-store.json");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ====== Раздаём public ======
app.use(express.static(path.join(__dirname, "../public")));

// ====== Настройки ======
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "8444438032:AAGNWu4mTOUqM_Sd12RHdD_CgD64Ypx9XjU";
const TELEGRAM_CHAT_ID_NEW = process.env.TELEGRAM_CHAT_ID_NEW || "-1003040492375";
const TELEGRAM_CHAT_ID_OLD = process.env.TELEGRAM_CHAT_ID_OLD || "-4966734338";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@site.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

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

// ====== Telegram ======
async function loadStoredChatId(token) {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    return data?.tokens?.[token] || null;
  } catch {
    return null;
  }
}
async function saveStoredChatId(token, chatId) {
  let data = { tokens: {} };
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    data = JSON.parse(raw) || { tokens: {} };
  } catch {}
  if (!data.tokens) data.tokens = {};
  data.tokens[token] = String(chatId);
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}
async function sendToTelegram(text) {
  const stored = await loadStoredChatId(TELEGRAM_TOKEN);
  const candidates = [...new Set([TELEGRAM_CHAT_ID_NEW, stored, TELEGRAM_CHAT_ID_OLD].filter(Boolean))];

  for (const cid of candidates) {
    try {
      const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: cid, text, disable_web_page_preview: true }),
      });
      const json = await resp.json();
      if (json.ok) {
        await saveStoredChatId(TELEGRAM_TOKEN, cid);
        return json;
      }
    } catch (err) {
      console.error("Telegram send error:", err);
    }
  }
  throw new Error("Все попытки отправки в Telegram не удались");
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

  const text = `📩 Новая заявка
━━━━━━━━━━━━━━━━━━━
👤 Имя: ${name}
📱 Телефон: ${phone}
📧 Email: ${email}
📝 Сообщение: ${message}
🧭 Участок: ${plotId}
🌐 Источник: ${source}`;

  try {
    await sendToTelegram(text);

    let leads = readJSONSafe(LEADS_PATH, []);
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

    leads.unshift(lead);
    writeJSONSafe(LEADS_PATH, leads);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка сохранения заявки:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====== Админка: логин + заявки ======
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = signToken({ sub: "admin", email });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Invalid login or password" });
});

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
