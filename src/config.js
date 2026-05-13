// src/config.js
const RAW = (import.meta.env.VITE_API_URL || "").trim();
export const API_URL = RAW.replace(/\/+$/, ""); // без хвостового /

// export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
// export const API_URL  = `${API_BASE}/api`;
