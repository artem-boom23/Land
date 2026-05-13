import { useEffect, useMemo, useState } from "react";
import PlotsMap from "../components/PlotsMap";
import { bc } from "../admin/bus";
import { fetchPublicPlots } from "../admin/api";

async function loadIndustrial() {
  if (import.meta.env.DEV) {
    const res = await fetch("/plots.json");
    if (!res.ok) throw new Error(`Plots fetch ${res.status}`);
    return res.json();
  }
  return fetchPublicPlots("industrial");
}

export default function IndustrialPage() {
  const category = "industrial";
  const [plots, setPlots] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  async function load() {
    try {
      const data = await loadIndustrial();
      setPlots(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      console.error("Ошибка загрузки участков:", err);
      setPlots([]);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onMsg = (e) => {
      const m = e?.data;
      if (m?.type === "plots-updated" && (!m.category || m.category === category)) {
        load();
        setRefreshKey((x) => x + 1);
      }
    };
    bc.addEventListener("message", onMsg);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      bc.removeEventListener("message", onMsg);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // мини-статистика для лид-подписи
  const { total, free } = useMemo(() => {
    const t = plots.length;
    const f = plots.filter(p => (p.status || "").toLowerCase() === "свободен").length;
    return { total: t, free: f };
  }, [plots]);

  return (
    // меньше верхнего отступа; корректный нижний
    <section className="pt-10 md:pt-8 px-4">
      <div className="w-full max-w-6xl mx-auto text-center mb-4 md:mb-6">
        {/* убрали pt у заголовка */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-green-700">
          Промышленные участки
        </h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Подготовленные площадки для бизнеса. Доступно{" "}
          <span className="font-semibold text-gray-900">{free}</span> из{" "}
          <span className="font-semibold text-gray-900">{total}</span> участков.
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto mb-10 md:mb-20">
        <PlotsMap key={refreshKey} plots={plots} />
      </div>
    </section>
  );
}



// import { useEffect, useState } from "react";
// import PlotsMap from "../components/PlotsMap";

// export default function IndustrialPage() {
//   const [plots, setPlots] = useState([]);

//   useEffect(() => {
//     fetch("https://ssd3smlyg70z7xcb.public.blob.vercel-storage.com/plots/plots.json")
//       .then((r) => r.json())
//       .then((data) => setPlots(data || []))
//       .catch((err) => console.error("Ошибка загрузки участков:", err));
//   }, []);

//   return (
//     <section className="pt-16 px-4">
//       <h2 className="text-2xl font-bold text-green-700 text-center mb-4">
//         Промышленные участки
//       </h2>
//       <div className="w-full max-w-6xl mx-auto">
//         <PlotsMap plots={plots} />
//       </div>
//     </section>
//   );
// }
