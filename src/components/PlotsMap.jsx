// src/components/PlotsMap.jsx
import { useEffect, useRef, useState } from "react";
import BookingModal from "./BookingModal";

/* ───────────────────────── helpers ───────────────────────── */
function loadYmapsOnce() {
  // Подгружаем скрипт Яндекс.Карт один раз, если его нет
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.ymaps && window.ymaps.ready) return Promise.resolve();

  const EXISTING = document.getElementById("ymaps-script");
  if (EXISTING) {
    return new Promise((resolve) => {
      const tick = () =>
        window.ymaps && window.ymaps.ready ? resolve() : setTimeout(tick, 40);
      tick();
    });
  }

  const s = document.createElement("script");
  s.id = "ymaps-script";
  s.async = true;
  s.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=a94936f6-59b6-4904-95c2-0704064256ae";
  document.head.appendChild(s);

  return new Promise((resolve) => {
    const tick = () =>
      window.ymaps && window.ymaps.ready ? resolve() : setTimeout(tick, 40);
    tick();
  });
}

function plotSig(p) {
  // Короткая сигнатура — чтобы обновлять только реально изменившиеся полигоны
  return JSON.stringify({
    id: p.id,
    q: p.queue || "",
    s: String(p.status || "").toLowerCase(),
    a: p.area || "",
    pr: p.price || "",
    cl: Array.isArray(p.coords) ? p.coords.length : 0,
  });
}

/* ───────────────────────── component ───────────────────────── */
export default function PlotsMap({ plots = [] }) {
  const mapRef = useRef(null);
  const mapNodeIdRef = useRef(`ymap-${Math.random().toString(36).slice(2)}`);

  // id -> { poly, sig }
  const polyMapRef = useRef(new Map());
  const queueBoundsRef = useRef({});
  const allBoundsRef = useRef(null);
  const didFitRef = useRef(false);

  // для «кнопки забронировать»
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [activeQueue, setActiveQueue] = useState(null);

  // смягчаем «пустые» промежуточные ответы
  const debounceTimerRef = useRef(null);

  /* 1) создаём карту ОДИН раз и больше не уничтожаем */
  useEffect(() => {
    let disposed = false;

    loadYmapsOnce().then(() => {
      if (disposed) return;
      window.ymaps.ready(() => {
        if (disposed) return;
        if (mapRef.current) return; // уже создана

        const myMap = new window.ymaps.Map(
          mapNodeIdRef.current,
          {
            center: [44.868425, 38.974461],
            zoom: 16,
            type: "yandex#satellite",
            controls: [],
          },
          { suppressMapOpenBlock: true }
        );

        mapRef.current = myMap;
      });
    });

    return () => {
      // Не уничтожаем карту, чтобы не было «мигания» при дев-сборке/HMR
      disposed = true;
      clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /* 2) дифф-обновление полигонов (без пересоздания карты) */
  useEffect(() => {
    const myMap = mapRef.current;
    const ym = window.ymaps;
    if (!myMap || !ym) return;

    if (!plots || plots.length === 0) {
      // Если пришёл пустой ответ — чуть подождём, возможно это промежуточный фетч
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        if (!mapRef.current) return;
        for (const [, rec] of polyMapRef.current) {
          try { mapRef.current.geoObjects.remove(rec.poly); } catch {}
        }
        polyMapRef.current.clear();
        queueBoundsRef.current = {};
        allBoundsRef.current = null;
        didFitRef.current = false;
      }, 600);
      return;
    }

    clearTimeout(debounceTimerRef.current);

    const nextIds = new Set();
    const byQueue = {};
    const polysForBounds = [];

    for (const p of plots) {
      if (!Array.isArray(p.coords) || !Array.isArray(p.coords[0])) continue;
      const id = String(p.id);
      const sig = plotSig(p);
      nextIds.add(id);

      const statusNorm = String(p.status || "").trim().toLowerCase();
      const isFree = statusNorm === "свободен" || statusNorm === "свободный";
      const isSold = statusNorm === "продан";
      const isRoad = statusNorm === "дорога";
      const displayStatus = isFree ? "Свободен" : isSold ? "Продан" : isRoad ? "Дорога" : (p.status || "-");

      const baseColor = isRoad
        ? "rgba(128,128,128,0.6)"
        : isFree
        ? "rgba(0,200,0,0.6)"
        : "rgba(200,0,0,0.6)";

      const hoverColor = isRoad
        ? "rgba(160,160,160,0.8)"
        : isFree
        ? "rgba(0,255,0,0.9)"
        : "rgba(255,0,0,0.9)";

      let rec = polyMapRef.current.get(id);

      if (!rec) {
        // создаём новый полигон
        let isSelected = false;
        const poly = new ym.Polygon(
          [p.coords],
          {
            hintContent: `Участок ${p.id}`,
            balloonContent: `
              <div style="font-size:14px;line-height:1.4">
                <strong>Участок ${p.id}</strong><br/>
                Очередь: ${p.queue || "-"}<br/>
                Площадь: ${p.area || "-"}<br/>
                Цена: ${p.price || "-"}<br/>
                Статус: <span style="color:${isFree ? "green" : isSold ? "red" : "gray"}">${displayStatus}</span><br/>
                ${
                  isFree
                    ? `<button class="book-btn" data-plot="${p.id}"
                         style="margin-top:6px;padding:6px 12px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer">
                         Забронировать
                       </button>`
                    : ""
                }
              </div>
            `,
          },
          {
            fillColor: baseColor,
            strokeColor: "#000",
            strokeWidth: 1,
            opacity: 0.7,
            fillOpacity: 0.7,
          }
        );

        poly.events.add("mouseenter", () => { if (!isSelected) poly.options.set("fillColor", hoverColor); });
        poly.events.add("mouseleave", () => { if (!isSelected) poly.options.set("fillColor", baseColor); });
        poly.events.add("balloonopen", () => { isSelected = true; poly.options.set("fillColor", hoverColor); });
        poly.events.add("balloonclose", () => { isSelected = false; poly.options.set("fillColor", baseColor); });

        myMap.geoObjects.add(poly);
        polyMapRef.current.set(id, { poly, sig });
        rec = polyMapRef.current.get(id);
      } else if (rec.sig !== sig) {
        // обновляем существующий
        try {
          rec.poly.geometry.setCoordinates([p.coords]);
          rec.poly.properties.set("hintContent", `Участок ${p.id}`);
          rec.poly.properties.set(
            "balloonContent",
            `
            <div style="font-size:14px;line-height:1.4">
              <strong>Участок ${p.id}</strong><br/>
              Очередь: ${p.queue || "-"}<br/>
              Площадь: ${p.area || "-"}<br/>
              Цена: ${p.price || "-"}<br/>
              Статус: <span style="color:${isFree ? "green" : isSold ? "red" : "gray"}">${displayStatus}</span><br/>
              ${isFree ? `<button class="book-btn" data-plot="${p.id}" style="margin-top:6px;padding:6px 12px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer">Забронировать</button>` : ""}
            </div>
          `
          );
          rec.poly.options.set("fillColor", baseColor);
          rec.sig = sig;
        } catch {}
      }

      polysForBounds.push(rec.poly);

      const q = p.queue || "Без очереди";
      if (!byQueue[q]) byQueue[q] = [];
      byQueue[q].push(rec.poly);
    }

    // удалить исчезнувшие
    for (const [id, rec] of polyMapRef.current.entries()) {
      if (!nextIds.has(id)) {
        try { mapRef.current.geoObjects.remove(rec.poly); } catch {}
        polyMapRef.current.delete(id);
      }
    }

    // bounds по очередям
    const qb = {};
    Object.entries(byQueue).forEach(([queueName, arr]) => {
      try {
        const b = window.ymaps.geoQuery(arr).getBounds();
        if (b) qb[queueName] = b;
      } catch {}
    });
    queueBoundsRef.current = qb;

    // общий fitBounds — только один раз
    if (!didFitRef.current && polysForBounds.length) {
      try {
        const all = window.ymaps.geoQuery(polysForBounds).getBounds();
        if (all) {
          allBoundsRef.current = all;
          mapRef.current.setBounds(all, { checkZoomRange: true, zoomMargin: 40 });
          didFitRef.current = true;
        }
      } catch {}
    }
  }, [plots]);

  /* 3) «Забронировать» из балуна → открываем модалку */
  useEffect(() => {
    const onDocClick = (e) => {
      const btn = e.target.closest && e.target.closest(".book-btn");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute("data-plot");
      if (id) {
        setSelectedPlot(id);
        try { mapRef.current && mapRef.current.balloon.close(); } catch {}
      }
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, []);

  /* ─────────────── fly controls ─────────────── */
  const flyToQueue = (queueName) => {
    const myMap = mapRef.current;
    const qb = queueBoundsRef.current;
    if (!myMap || !qb[queueName]) return;
    setActiveQueue(queueName);
    try {
      myMap.setBounds(qb[queueName], { checkZoomRange: true, zoomMargin: 40, duration: 500 });
    } catch {}
  };

  const flyToAll = () => {
    const myMap = mapRef.current;
    if (!myMap || !allBoundsRef.current) return;
    setActiveQueue(null);
    try {
      myMap.setBounds(allBoundsRef.current, { checkZoomRange: true, zoomMargin: 40, duration: 500 });
    } catch {}
  };

  const queues = Array.from(new Set((plots || []).map((p) => p.queue).filter(Boolean))).sort();

  /* ───────────────────────── render ───────────────────────── */
  return (
    <div style={{ position: "relative" }}>
      <div
        id={mapNodeIdRef.current}
        style={{ width: "100%", height: "600px", borderRadius: "20px", overflow: "hidden" }}
      />

      {/* Панель очередей (перелёт, без фильтрации) */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          background: "rgba(255,255,255,0.9)",
          padding: "10px",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 5,
        }}
      >
        {queues.map((q) => (
          <button
            key={q}
            onClick={() => flyToQueue(q)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: activeQueue === q ? "#28a745" : "#6c757d",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
            title={`Показать границы: ${q}`}
          >
            {q}
          </button>
        ))}
        <button
          onClick={flyToAll}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: activeQueue === null ? "#28a745" : "#6c757d",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
          title="Показать все участки"
        >
          Все
        </button>
      </div>

      {selectedPlot && (
        <BookingModal
          plotId={selectedPlot}
          source="map"
          onClose={() => setSelectedPlot(null)}
        />
      )}
    </div>
  );
}









// import { useEffect, useState, useRef } from "react";
// import BookingModal from "./BookingModal";

// export default function IndustrialMap() {
//   const [map, setMap] = useState(null);
//   const [queueBounds, setQueueBounds] = useState({});
//   const [polygons, setPolygons] = useState([]);
//   const [activeQueue, setActiveQueue] = useState(null);
//   const [selectedPlot, setSelectedPlot] = useState(null);
//   const [filters, setFilters] = useState({ свободен: true, продан: true });

//   const allBoundsRef = useRef(null);

//   // Загружаем участки с бэкенда
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const resp = await fetch("http://localhost:3001/api/plots");
//         const data = await resp.json();
//         return data.items || [];
//       } catch (err) {
//         console.error("Ошибка загрузки участков:", err);
//         return [];
//       }
//     };

//     if (!window.ymaps) return;

//     window.ymaps.ready(async () => {
//       const el = document.getElementById("yandex-map");
//       if (!el) return;
//       el.innerHTML = "";

//       const myMap = new window.ymaps.Map(
//         "yandex-map",
//         {
//           center: [44.868425, 38.974461],
//           zoom: 16,
//           type: "yandex#satellite",
//           controls: [],
//         },
//         { suppressMapOpenBlock: true }
//       );

//       setMap(myMap);

//       const plots = await loadData();
//       const polys = [];
//       const byQueue = {};

//       plots
//         .filter((p) => p.category === "industrial") // 🔥 фильтруем по категории
//         .forEach((plot) => {
//           const statusNorm = (plot.status || "").trim().toLowerCase();
//           const isFree = statusNorm === "свободен";
//           const isSold = statusNorm === "продан";
//           const isRoad = statusNorm === "дорога";

//           const displayStatus = isFree ? "Свободен" : isSold ? "Продан" : "Дорога";

//           const baseColor = isRoad
//             ? "rgba(128,128,128,0.6)"
//             : isFree
//             ? "rgba(0,200,0,0.6)"
//             : "rgba(200,0,0,0.6)";

//           const hoverColor = isRoad
//             ? "rgba(160,160,160,0.8)"
//             : isFree
//             ? "rgba(0,255,0,0.9)"
//             : "rgba(255,0,0,0.9)";

//           let isSelected = false;

//           const polygon = new window.ymaps.Polygon(
//             [plot.coords],
//             {
//               hintContent: `Участок ${plot.id}`,
//               balloonContent: `
//                 <div style="font-size:14px;line-height:1.4">
//                   <strong>Участок ${plot.id}</strong><br/>
//                   Очередь: ${plot.queue || "-"}<br/>
//                   Площадь: ${plot.area || "-"}<br/>
//                   Цена: ${plot.price || "-"}<br/>
//                   Статус: <span style="color:${
//                     isFree ? "green" : isSold ? "red" : "gray"
//                   }">${displayStatus}</span><br/>
//                   ${
//                     isFree
//                       ? `<button class="book-btn" data-plot="${plot.id}"
//                            style="margin-top:6px;padding:6px 12px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer">
//                            Забронировать
//                          </button>`
//                       : ""
//                   }
//                 </div>
//               `,
//             },
//             {
//               fillColor: baseColor,
//               strokeColor: "#000",
//               strokeWidth: 1,
//               opacity: 0.7,
//               fillOpacity: 0.7,
//             }
//           );

//           polygon.events.add("mouseenter", () => {
//             if (!isSelected) polygon.options.set("fillColor", hoverColor);
//           });
//           polygon.events.add("mouseleave", () => {
//             if (!isSelected) polygon.options.set("fillColor", baseColor);
//           });
//           polygon.events.add("balloonopen", () => {
//             isSelected = true;
//             polygon.options.set("fillColor", hoverColor);
//           });
//           polygon.events.add("balloonclose", () => {
//             isSelected = false;
//             polygon.options.set("fillColor", baseColor);
//           });

//           myMap.geoObjects.add(polygon);
//           polys.push({ polygon, status: statusNorm, queue: plot.queue });
//         });

//       // Собираем bounds по очередям
//       ["1 очередь", "2 очередь", "3 очередь"].forEach((queue) => {
//         const qPolys = polys.filter((p) => p.queue === queue).map((p) => p.polygon);
//         if (qPolys.length) {
//           byQueue[queue] = window.ymaps.geoQuery(qPolys).getBounds();
//         }
//       });

//       setQueueBounds(byQueue);
//       setPolygons(polys);

//       // Общие границы
//       if (polys.length) {
//         const bounds = window.ymaps.geoQuery(myMap.geoObjects).getBounds();
//         allBoundsRef.current = bounds;
//         myMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
//       }
//     });
//   }, []);

//   // Глобальный обработчик кнопки "Забронировать"
//   useEffect(() => {
//     const onDocClick = (e) => {
//       const btn = e.target.closest && e.target.closest(".book-btn");
//       if (!btn) return;

//       e.preventDefault();
//       e.stopPropagation();

//       const id = btn.getAttribute("data-plot");
//       if (id) {
//         setSelectedPlot(id);
//         try {
//           map?.balloon?.close();
//         } catch {}
//       }
//     };

//     document.addEventListener("click", onDocClick, true);
//     return () => document.removeEventListener("click", onDocClick, true);
//   }, [map]);

//   // Фильтры
//   useEffect(() => {
//     polygons.forEach(({ polygon, status }) => {
//       polygon.options.set("visible", !!filters[status]);
//     });
//   }, [filters, polygons]);

//   const goToQueue = (queue) => {
//     if (map && queueBounds[queue]) {
//       setActiveQueue(queue);
//       map.setBounds(queueBounds[queue], {
//         checkZoomRange: true,
//         zoomMargin: 40,
//         duration: 500,
//       });
//     }
//   };

//   const goToAll = () => {
//     if (map && allBoundsRef.current) {
//       setActiveQueue(null);
//       map.setBounds(allBoundsRef.current, {
//         checkZoomRange: true,
//         zoomMargin: 40,
//         duration: 500,
//       });
//     }
//   };

//   const buttonStyle = (isActive) => ({
//     flex: "0 0 auto",
//     minWidth: "100px",
//     padding: "8px 14px",
//     backgroundColor: isActive ? "#28a745" : "#6c757d",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontWeight: "bold",
//     transition: "background 0.2s, transform 0.2s",
//   });

//   return (
//     <div style={{ position: "relative" }}>
//       <div
//         id="yandex-map"
//         style={{
//           width: "100%",
//           height: "600px",
//           borderRadius: "20px",
//           overflow: "hidden",
//         }}
//       />

//       {/* Панель кнопок + фильтры */}
//       <div
//         style={{
//           position: "absolute",
//           bottom: "20px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           display: "flex",
//           flexDirection: "column",
//           gap: "10px",
//           background: "rgba(255,255,255,0.9)",
//           backdropFilter: "blur(6px)",
//           padding: "10px",
//           borderRadius: "12px",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           width: "90%",
//           maxWidth: "500px",
//           zIndex: 20,
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             gap: "10px",
//             paddingBottom: "4px",
//             overflowX:
//               typeof window !== "undefined" && window.innerWidth < 600
//                 ? "auto"
//                 : "visible",
//           }}
//         >
//           {["1 очередь", "2 очередь", "3 очередь"].map((queue, i) => (
//             <button
//               key={i}
//               onClick={() => goToQueue(queue)}
//               style={buttonStyle(activeQueue === queue)}
//             >
//               {queue}
//             </button>
//           ))}
//           <button
//             onClick={goToAll}
//             style={{ ...buttonStyle(activeQueue === null), minWidth: "120px" }}
//           >
//             Все участки
//           </button>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-around",
//             flexWrap: "wrap",
//             gap: "10px",
//           }}
//         >
//           <label>
//             <input
//               type="checkbox"
//               checked={filters["свободен"]}
//               onChange={(e) =>
//                 setFilters({ ...filters, свободен: e.target.checked })
//               }
//             />{" "}
//             Свободные
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               checked={filters["продан"]}
//               onChange={(e) =>
//                 setFilters({ ...filters, продан: e.target.checked })
//               }
//             />{" "}
//             Проданные
//           </label>
//         </div>
//       </div>

//       {/* Модалка */}
//       {selectedPlot && (
//         <BookingModal
//           plotId={selectedPlot}
//           source="map"
//           onClose={() => setSelectedPlot(null)}
//         />
//       )}
//     </div>
//   );
// }








// // src/components/IndustrialMap.jsx
// import { useEffect, useState, useRef } from "react";
// import BookingModal from "./BookingModal";

// export default function IndustrialMap() {
//   const [map, setMap] = useState(null);
//   const [queueBounds, setQueueBounds] = useState({});
//   const [polygons, setPolygons] = useState([]);
//   const [activeQueue, setActiveQueue] = useState(null);
//   const allBoundsRef = useRef(null);

//   const [filters, setFilters] = useState({
//     свободен: true,
//     продан: true,
//   });

//   const [selectedPlot, setSelectedPlot] = useState(null);

//   // 1) Инициализация карты ОДИН раз
//   useEffect(() => {
//     if (!window.ymaps) return;

//     window.ymaps.ready(async () => {
//       const el = document.getElementById("yandex-map");
//       if (!el) return;
//       el.innerHTML = "";

//       const myMap = new window.ymaps.Map(
//         "yandex-map",
//         {
//           center: [44.868425, 38.974461],
//           zoom: 16,
//           type: "yandex#satellite",
//           controls: [],
//         },
//         { suppressMapOpenBlock: true }
//       );

//       setMap(myMap);

//       try {
//         const resp = await fetch("/plots.json");
//         const plots = await resp.json();

//         const polys = [];
//         const byQueue = {};

//         plots.forEach((plot) => {
//           const statusNorm = (plot.status || "").trim().toLowerCase();
//           const isFree = statusNorm === "свободен";
//           const isSold = statusNorm === "продан";
//           const isRoad = statusNorm === "дорога";

//           const displayStatus = isFree ? "Свободен" : isSold ? "Продан" : "Дорога";

//           const baseColor = isRoad
//             ? "rgba(128,128,128,0.6)"
//             : isFree
//             ? "rgba(0,200,0,0.6)"
//             : "rgba(200,0,0,0.6)";

//           const hoverColor = isRoad
//             ? "rgba(160,160,160,0.8)"
//             : isFree
//             ? "rgba(0,255,0,0.9)"
//             : "rgba(255,0,0,0.9)";

//           let isSelected = false;

//           const polygon = new window.ymaps.Polygon(
//             [plot.coords],
//             {
//               hintContent: `Участок ${plot.id}`,
//               // ВАЖНО: без inline onclick. Кнопке даём класс и data-атрибут.
//               balloonContent: `
//                 <div style="font-size:14px;line-height:1.4">
//                   <strong>Участок ${plot.id}</strong><br/>
//                   Очередь: ${plot.queue || "-"}<br/>
//                   Площадь: ${plot.area || "-"}<br/>
//                   Цена: ${plot.price || "-"}<br/>
//                   Статус: <span style="color:${
//                     isFree ? "green" : isSold ? "red" : "gray"
//                   }">${displayStatus}</span><br/>
//                   ${
//                     isFree
//                       ? `<button class="book-btn" data-plot="${plot.id}"
//                            style="margin-top:6px;padding:6px 12px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer">
//                            Забронировать
//                          </button>`
//                       : ""
//                   }
//                 </div>
//               `,
//             },
//             {
//               fillColor: baseColor,
//               strokeColor: "#000",
//               strokeWidth: 1,
//               opacity: 0.7,
//               fillOpacity: 0.7,
//             }
//           );

//           polygon.events.add("mouseenter", () => {
//             if (!isSelected) polygon.options.set("fillColor", hoverColor);
//           });
//           polygon.events.add("mouseleave", () => {
//             if (!isSelected) polygon.options.set("fillColor", baseColor);
//           });
//           polygon.events.add("balloonopen", () => {
//             isSelected = true;
//             polygon.options.set("fillColor", hoverColor);
//           });
//           polygon.events.add("balloonclose", () => {
//             isSelected = false;
//             polygon.options.set("fillColor", baseColor);
//           });

//           myMap.geoObjects.add(polygon);
//           polys.push({ polygon, status: statusNorm, queue: plot.queue });
//         });

//         // Собираем bounds по очередям
//         ["1 очередь", "2 очередь", "3 очередь"].forEach((queue) => {
//           const qPolys = polys.filter((p) => p.queue === queue).map((p) => p.polygon);
//           if (qPolys.length) {
//             byQueue[queue] = window.ymaps.geoQuery(qPolys).getBounds();
//           }
//         });

//         setQueueBounds(byQueue);
//         setPolygons(polys);

//         // Общие границы
//         if (polys.length) {
//           const bounds = window.ymaps.geoQuery(myMap.geoObjects).getBounds();
//           allBoundsRef.current = bounds;
//           myMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
//         }
//       } catch (e) {
//         console.error("Ошибка загрузки plots.json:", e);
//       }
//     });
//   }, []);

//   // 2) Глобальный обработчик кликов по кнопке из балуна (capture = true)
//   useEffect(() => {
//     const onDocClick = (e) => {
//       const btn = e.target.closest && e.target.closest(".book-btn");
//       if (!btn) return;

//       e.preventDefault();
//       e.stopPropagation();

//       const id = btn.getAttribute("data-plot");
//       if (id) {
//         setSelectedPlot(id);
//         try {
//           map?.balloon?.close();
//         } catch {}
//       }
//     };

//     // capture=true — ловим даже если внутри балуна стопают события
//     document.addEventListener("click", onDocClick, true);
//     return () => document.removeEventListener("click", onDocClick, true);
//   }, [map]);

//   // 3) Фильтры
//   useEffect(() => {
//     polygons.forEach(({ polygon, status }) => {
//       polygon.options.set("visible", !!filters[status]);
//     });
//   }, [filters, polygons]);

//   const goToQueue = (queue) => {
//     if (map && queueBounds[queue]) {
//       setActiveQueue(queue);
//       map.setBounds(queueBounds[queue], {
//         checkZoomRange: true,
//         zoomMargin: 40,
//         duration: 500,
//       });
//     }
//   };

//   const goToAll = () => {
//     if (map && allBoundsRef.current) {
//       setActiveQueue(null);
//       map.setBounds(allBoundsRef.current, {
//         checkZoomRange: true,
//         zoomMargin: 40,
//         duration: 500,
//       });
//     }
//   };

//   const buttonStyle = (isActive) => ({
//     flex: "0 0 auto",
//     minWidth: "100px",
//     padding: "8px 14px",
//     backgroundColor: isActive ? "#28a745" : "#6c757d",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontWeight: "bold",
//     transition: "background 0.2s, transform 0.2s",
//   });

//   return (
//     <div style={{ position: "relative" }}>
//       <div
//         id="yandex-map"
//         style={{
//           width: "100%",
//           height: "600px",
//           borderRadius: "20px",
//           overflow: "hidden",
//         }}
//       />

//       {/* Панель кнопок + фильтры */}
//       <div
//         style={{
//           position: "absolute",
//           bottom: "20px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           display: "flex",
//           flexDirection: "column",
//           gap: "10px",
//           background: "rgba(255,255,255,0.9)",
//           backdropFilter: "blur(6px)",
//           padding: "10px",
//           borderRadius: "12px",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           width: "90%",
//           maxWidth: "500px",
//           zIndex: 20,
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             gap: "10px",
//             paddingBottom: "4px",
//             overflowX:
//               typeof window !== "undefined" && window.innerWidth < 600
//                 ? "auto"
//                 : "visible",
//           }}
//         >
//           {["1 очередь", "2 очередь", "3 очередь"].map((queue, i) => (
//             <button
//               key={i}
//               onClick={() => goToQueue(queue)}
//               style={buttonStyle(activeQueue === queue)}
//             >
//               {queue}
//             </button>
//           ))}
//           <button
//             onClick={goToAll}
//             style={{ ...buttonStyle(activeQueue === null), minWidth: "120px" }}
//           >
//             Все участки
//           </button>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-around",
//             flexWrap: "wrap",
//             gap: "10px",
//           }}
//         >
//           <label>
//             <input
//               type="checkbox"
//               checked={filters["свободен"]}
//               onChange={(e) =>
//                 setFilters({ ...filters, свободен: e.target.checked })
//               }
//             />{" "}
//             Свободные
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               checked={filters["продан"]}
//               onChange={(e) =>
//                 setFilters({ ...filters, продан: e.target.checked })
//               }
//             />{" "}
//             Проданные
//           </label>
//         </div>
//       </div>

//       {/* Модалка */}
//       {selectedPlot && (
//         <BookingModal
//           plotId={selectedPlot}
//           source="map"                // ← метка «пришло с карты»
//           onClose={() => setSelectedPlot(null)}
//         />
//       )}
//     </div>
//   );
// }
