// src/admin/api.js

const API_URL = (import.meta?.env?.VITE_API_URL || "").replace(/\/+$/,"");

/** токен в localStorage (Bare и Raw совместимы с твоим PrivateRoute) */
export function setToken(token) {
  const raw = token || "";
  try { localStorage.setItem("token_raw", raw); } catch {}
  try { localStorage.setItem("token", raw.replace(/^Bearer\s+/i, "")); } catch {}
}
export function clearToken() {
  try { localStorage.removeItem("token_raw"); } catch {}
  try { localStorage.removeItem("token"); } catch {}
}
export function getTokenRaw() {
  try { return localStorage.getItem("token_raw") || ""; } catch { return ""; }
}
export function getTokenBare() {
  try { return localStorage.getItem("token") || ""; } catch { return ""; }
}

/** логин → { token } */
export async function adminLogin(email, password) {
  const res = await fetch(`${API_URL}/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || `Login failed (${res.status})`);
  const raw = (data.token || data.accessToken || data.jwt || "").toString();
  setToken(raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`);
  return data;
}

/** обёртка с авторизацией */
async function authedFetch(path, opts = {}) {
  const raw = getTokenRaw();   // "Bearer <jwt>"
  const bare = getTokenBare(); // "<jwt>"
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    ...(raw ? { Authorization: raw, "X-Auth-Token": bare, "x-access-token": bare } : {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");
  const body = isJSON ? await res.json().catch(() => ({})) : await res.text();
  if (res.status === 401 || res.status === 403) { clearToken(); throw new Error("UNAUTHORIZED"); }
  if (!res.ok) throw new Error(isJSON ? JSON.stringify(body) : (body || res.statusText));
  return body;
}

/** публичное чтение участков (если нужно) */
export async function fetchPublicPlots(category) {
  const res = await fetch(`${API_URL}/plots?category=${encodeURIComponent(category)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GET /plots ${res.status}`);
  return data;
}

/** админ-эндпоинты */
export const AdminAPI = {
  // участки
  getPlots(category) {
    return authedFetch(`/admin-plots?category=${encodeURIComponent(category)}`, { method: "GET" });
  },
  addPlot(payload, category) {
    return authedFetch(`/admin-plots?category=${encodeURIComponent(category)}`, {
      method: "POST", body: JSON.stringify(payload || {}),
    });
  },
  updatePlot(id, patch, category) {
    return authedFetch(`/admin-plots?category=${encodeURIComponent(category)}&id=${encodeURIComponent(id)}`, {
      method: "PUT", body: JSON.stringify(patch || {}),
    });
  },
  deletePlot(id, category) {
    return authedFetch(`/admin-plots?category=${encodeURIComponent(category)}&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  // заявки
  getRequests(limit = 100) {
    return authedFetch(`/requests?limit=${limit}`, { method: "GET" });
  },
  updateRequestStatus(id, status) {
    return authedFetch(`/requests`, { method: "PATCH", body: JSON.stringify({ id, status }) });
  },
};
