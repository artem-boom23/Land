// src/pages/InvestPage.jsx
import { useEffect, useState } from "react";
import PlotsMap from "../components/PlotsMap";
import { bc } from "../admin/bus";
import UnderConstruction from "../components/UnderConstruction";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function loadInvest() {
  const url = `${API_BASE}/plots?category=invest&t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Plots API ${res.status}`);
  return res.json(); // бэкенд отдаёт массив
}

// export default function InvestPage() {
//   return <UnderConstruction title="Инвестиционные участки" />;
// }
export default function InvestPage() {
  return <UnderConstruction title="Рекреация - туризм" />;
}

// export default function InvestPage() {
//   const category = "invest";
//   const [plots, setPlots] = useState([]);
//   const [refreshKey, setRefreshKey] = useState(0);

//   async function load() {
//     try {
//       const data = await loadInvest();
//       setPlots(Array.isArray(data) ? data : (data?.items || []));
//     } catch (e) {
//       console.error("Ошибка загрузки участков:", e);
//       setPlots([]);
//     }
//   }

//   useEffect(() => { load(); }, []);

//   useEffect(() => {
//     const onMsg = (e) => {
//       const m = e?.data;
//       if (m?.type === "plots-updated" && (!m.category || m.category === category)) {
//         load();
//         setRefreshKey((x) => x + 1); // форсируем полную перерисовку PlotsMap
//       }
//     };
//     bc.addEventListener("message", onMsg);

//     const onFocus = () => load();
//     window.addEventListener("focus", onFocus);

//     return () => {
//       bc.removeEventListener("message", onMsg);
//       window.removeEventListener("focus", onFocus);
//     };
//   }, []);

//   return (
//     <section className="pt-16 pb-15 px-4">
//       <h2 className="text-2xl font-bold pt-16 text-green-700 text-center mb-4">
//         Инвестиционные участки
//       </h2>
//       <div className="w-full max-w-6xl mx-auto">
//         <PlotsMap plots={plots} />
//       </div>
//     </section>
//   );
// }



