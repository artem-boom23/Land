// src/admin/api.js
import { API_URL } from "../config";

/* ========== token helpers ========== */
export function setToken(token) {
  try { localStorage.setItem("token", token || ""); } catch {}
  try { localStorage.setItem("token_raw", token || ""); } catch {}
}
export function clearToken() {
  try { localStorage.removeItem("token"); } catch {}
  try { localStorage.removeItem("token_raw"); } catch {}
}
export function getTokenValue() {
  try { return localStorage.getItem("token") || ""; } catch { return ""; }
}
function getTokenRaw() {
  try { return localStorage.getItem("token_raw") || ""; } catch { return ""; }
}

/* ========== login ========== */
export async function adminLogin(email, password) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");
  const data = isJSON ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const msg = isJSON ? (data?.error || data?.message) : data;
    throw new Error(msg || `Login failed (${res.status})`);
  }
  const raw = (data && (data.token || data.accessToken || data.jwt)) || "";
  setToken(raw);
  return data;
}

/* ========== authed fetch ========== */
async function authedFetch(url, opts = {}) {
  const raw = getTokenRaw();
  const bare = getTokenValue();

  const baseHeaders = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  const authHeaders = raw
    ? {
        Authorization: raw.startsWith("Bearer ") || raw.startsWith("JWT ") ? raw : `Bearer ${raw}`,
        "X-Auth-Token": bare.replace(/^(Bearer|JWT)\s+/i, ""),
        "x-auth-token": bare.replace(/^(Bearer|JWT)\s+/i, ""),
        "x-access-token": bare.replace(/^(Bearer|JWT)\s+/i, ""),
      }
    : {};

  const res = await fetch(url, { ...opts, headers: { ...baseHeaders, ...authHeaders } });
  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");
  const body = isJSON ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const text = isJSON ? JSON.stringify(body) : String(body || "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return body;
}

/* ========== public plots (без токена) ========== */
async function fetchPublicPlots(category) {
  const res = await fetch(`${API_URL}/plots?category=${encodeURIComponent(category)}`);
  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");
  const data = isJSON ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const text = isJSON ? JSON.stringify(data) : data;
    throw new Error(`GET /plots failed: ${res.status} ${text || ""}`);
  }
  return data;
}

/* ========== Admin API ========== */
export const AdminAPI = {
  // список участков читаем с публичного роута
  async getPlots(category) {
    const data = await fetchPublicPlots(category);
    const items = Array.isArray(data) ? data : data.items || [];
    return { items };
  },

  updatePlot(id, payload, category) {
    return authedFetch(
      `${API_URL}/admin/plots/${encodeURIComponent(id)}?category=${encodeURIComponent(category)}`,
      { method: "PUT", body: JSON.stringify(payload || {}) }
    );
  },

  addPlot(payload, category) {
    return authedFetch(
      `${API_URL}/admin/plots?category=${encodeURIComponent(category)}`,
      { method: "POST", body: JSON.stringify({ ...(payload || {}), category }) }
    );
  },

  // ⬇️ НОВОЕ: удаление участка
  deletePlot(id, category) {
    return authedFetch(
      `${API_URL}/admin/plots/${encodeURIComponent(id)}?category=${encodeURIComponent(category)}`,
      { method: "DELETE" }
    );
  },

  getRequests() {
    return authedFetch(`${API_URL}/admin/requests`, { method: "GET" });
  },

  updateRequestStatus(id, payload) {
    return authedFetch(`${API_URL}/admin/requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload || {}),
    });
  },
};
