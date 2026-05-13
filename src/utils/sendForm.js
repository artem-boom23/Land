// src/utils/sendForm.js
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// 👇 временный лог — потом удалишь
if (typeof window !== "undefined") {
  console.log("[sendForm] API_BASE =", API_BASE);
  // на всякий случай, чтобы можно было посмотреть из консоли:
  window.__API_BASE = API_BASE;
}

export default async function sendForm(data, source = "", extra = {}) {
  const payload = {
    ...data,
    source,
    pageUrl: extra.pageUrl || (typeof window !== "undefined" ? window.location.href : ""),
  };

  const res = await fetch(`${API_BASE}/send-form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Ошибка API (${res.status}): ${errText}`);
  }
  return res.json();
}
