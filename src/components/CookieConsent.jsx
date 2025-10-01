// src/components/CookieConsent.jsx
import { useEffect, useState } from "react";

const STORE_KEY = "cookieConsent"; // {status:'accepted'|'declined', analytics:boolean, marketing:boolean}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const save = (status) => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ status, ...prefs }));
    } catch {}
  };

  const acceptAll = () => {
    setPrefs({ analytics: true, marketing: true });
    save("accepted");
    setOpen(false);
    // здесь можно инициализировать аналитику по согласию
    // initYandexMetrika();
  };

  const acceptSelected = () => {
    save("accepted");
    setOpen(false);
    // init по prefs.analytics / prefs.marketing если подключите
  };

  const decline = () => {
    setPrefs({ analytics: false, marketing: false });
    save("declined");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div style={wrap}>
      <div style={box}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 600 }}>Мы используем файлы cookie</div>
          <div style={{ fontSize: 14, color: "#374151" }}>
            Cookie помогают сайту работать корректно и улучшать сервис. Подробнее —{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" style={link}>Политика конфиденциальности</a>.
          </div>

          {expanded && (
            <div style={prefsBox}>
              <label style={row}>
                <input type="checkbox" checked readOnly />
                <span>Технические (обязательные)</span>
              </label>
              <label style={row}>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                />
                <span>Аналитика</span>
              </label>
              <label style={row}>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                />
                <span>Маркетинг</span>
              </label>
            </div>
          )}

          <div style={actions}>
            <button onClick={acceptAll} style={btnPrimary}>Принять все</button>
            <button onClick={expanded ? acceptSelected : () => setExpanded(true)} style={btn}>
              {expanded ? "Сохранить выбор" : "Настройки"}
            </button>
            <button onClick={decline} style={btnGhost}>Отклонить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const wrap = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
  padding: "12px",
  zIndex: 9999,
};

const box = {
  width: "min(900px, 96vw)",
  background: "#fff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(0,0,0,.1)",
  borderRadius: 12,
  padding: 12,
};

const prefsBox = {
  border: "1px dashed #e5e7eb",
  borderRadius: 8,
  padding: 10,
  display: "grid",
  gap: 6,
  background: "#f9fafb",
};

const row = { display: "flex", alignItems: "center", gap: 8, fontSize: 14 };
const actions = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 };
const btn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" };
const btnGhost = { ...btn, background: "#f9fafb" };
const btnPrimary = { ...btn, background: "#16a34a", color: "#fff", borderColor: "#16a34a" };
const link = { color: "#16a34a", textDecoration: "underline" };
