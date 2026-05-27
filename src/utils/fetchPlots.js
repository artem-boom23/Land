const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function fetchPlots(category) {
  const url = import.meta.env.DEV
    ? `/${category === "invest" ? "plots-invest" : category === "izhs" ? "plots-izhs" : "plots"}.json`
    : `${API_BASE}/plots?category=${encodeURIComponent(category)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Plots fetch ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.items || []);
}
