// server/utils/sendForm.js
export default function sendForm(req, res) {
  try {
    const data = req.body;
    console.log("📩 Получена форма:", data);

    // Здесь можно добавить:
    // - сохранение в БД
    // - отправку email
    // - запись в файл

    res.json({ success: true, message: "Форма успешно отправлена!" });
  } catch (err) {
    console.error("❌ Ошибка при обработке формы:", err);
    res.status(500).json({ success: false, error: "Ошибка сервера" });
  }
}

