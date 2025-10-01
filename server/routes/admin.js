// server/routes/admin.js
import express from "express";
import fs from "fs/promises";
import path from "path";

function auth(req, res, next) {
  const h = req.headers.authorization || req.headers["x-auth-token"] || req.headers["x-access-token"];
  if (!h) return res.status(401).json({ error: "No token" });
  return next();
}

const router = express.Router();

/** маппим category -> файл в public/ */
function resolveFileByCategory(categoryRaw) {
  const category = String(categoryRaw || "industrial").toLowerCase();
  const fname =
    category === "izhs"
      ? "plots-izhs.json"
      : category === "invest"
      ? "plots-invest.json"
      : "plots.json"; // industrial по умолчанию
  const filePath = path.join(process.cwd(), "public", fname);
  return { filePath, fname };
}

/** DELETE /api/admin/plots/:id?category=industrial|izhs|invest */
router.delete("/plots/:id", auth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { filePath, fname } = resolveFileByCategory(req.query.category);

    // читаем текущий список
    let list = [];
    try {
      const raw = await fs.readFile(filePath, "utf8");
      list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
    } catch {
      // файла может не быть — считаем пустым
      list = [];
    }

    // ищем по строковому id
    const idx = list.findIndex((p) => String(p?.id) === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Plot not found in " + fname });
    }

    // удаляем
    list.splice(idx, 1);

    // атомарная запись (tmp -> rename)
    const tmp = `${filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
    await fs.rename(tmp, filePath);

    return res.json({ ok: true, id, file: fname, items: list });
  } catch (e) {
    console.error("DELETE /admin/plots error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
