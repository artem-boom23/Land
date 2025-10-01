// server/routes/admin-plots-delete.js
const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const router = express.Router();

// поправь путь, если у тебя auth лежит в другом месте
const { authMiddleware } = require("../auth");

function plotsFileByCategory(category) {
  switch (String(category)) {
    case "industrial":
      return path.join(__dirname, "../public/plots-industrial.json");
    case "izhs":
      return path.join(__dirname, "../public/plots-izhs.json");
    case "invest":
      return path.join(__dirname, "../public/plots-invest.json");
    default:
      throw new Error("Unknown category");
  }
}

router.delete("/admin/plots/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;
    if (!category) return res.status(400).json({ error: "category is required" });

    const file = plotsFileByCategory(category);

    let raw;
    try {
      raw = await fs.readFile(file, "utf8");
    } catch {
      return res.status(500).json({ error: "plots file read error" });
    }

    let list;
    try {
      list = JSON.parse(raw);
      if (!Array.isArray(list)) throw new Error("not array");
    } catch {
      return res.status(500).json({ error: "invalid plots JSON" });
    }

    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: "plot not found" });

    list.splice(idx, 1);

    try {
      await fs.writeFile(file, JSON.stringify(list, null, 2));
    } catch {
      return res.status(500).json({ error: "write failed" });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "delete failed" });
  }
});

module.exports = router;
