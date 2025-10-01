// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminLogin, clearToken, setToken } from "../../admin/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const nav = useNavigate();
  const loc = useLocation();
  // если нас перекинул PrivateRoute — тут будет путь, куда хотели попасть
  const redirectTo = (loc.state && loc.state.from) || "/admin/requests";

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await adminLogin(email.trim(), password);
      // подстрахуемся: положим токен в оба ключа
      const raw = (data && (data.token || data.accessToken || data.jwt)) || localStorage.getItem("token_raw") || localStorage.getItem("token") || "";
      if (raw) setToken(raw);
      nav(redirectTo, { replace: true });
    } catch (ex) {
      console.error("Login error:", ex);
      setErr(String(ex?.message || "Не удалось войти"));
      clearToken();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: 360, maxWidth: "95vw", background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Вход в админку</h2>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Пароль</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>

        {err && <div style={{ color: "crimson", fontSize: 14, whiteSpace: "pre-wrap" }}>{err}</div>}

        <button type="submit" disabled={loading} style={{ padding: "10px 14px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 8, cursor: loading ? "default" : "pointer" }}>
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
