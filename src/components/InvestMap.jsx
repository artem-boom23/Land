// src/components/InvestMap.jsx
import { useEffect, useState, useRef } from "react";
import BookingModal from "./BookingModal";

export default function InvestMap({ plots = [] }) {
  const [map, setMap] = useState(null);
  const [queueBounds, setQueueBounds] = useState({});
  const [polygons, setPolygons] = useState([]);
  const [activeQueue, setActiveQueue] = useState(null);
  const allBoundsRef = useRef(null);

  const [filters, setFilters] = useState({
    свободен: true,
    продан: true,
  });

  const [selectedPlot, setSelectedPlot] = useState(null);

  // 1) Инициализация карты
  useEffect(() => {
    if (!window.ymaps) return;

    window.ymaps.ready(() => {
      const el = document.getElementById("yandex-map-invest");
      if (!el) return;
      el.innerHTML = "";

      const myMap = new window.ymaps.Map(
        "yandex-map-invest",
        {
          center: [44.868425, 38.974461],
          zoom: 16,
          type: "yandex#satellite",
          controls: [],
        },
        { suppressMapOpenBlock: true }
      );

      setMap(myMap);

      const polys = [];
      const byQueue = {};

      plots.forEach((plot) => {
        const statusNorm = (plot.status || "").trim().toLowerCase();
        const isFree = statusNorm === "свободен";
        const isSold = statusNorm === "продан";
        const isRoad = statusNorm === "дорога";

        const displayStatus = isFree ? "Свободен" : isSold ? "Продан" : "Дорога";

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

        let isSelected = false;

        const polygon = new window.ymaps.Polygon(
          [plot.coords],
          {
            hintContent: `Участок ${plot.id}`,
            balloonContent: `
              <div style="font-size:14px;line-height:1.4">
                <strong>Участок ${plot.id}</strong><br/>
                Очередь: ${plot.queue || "-"}<br/>
                Площадь: ${plot.area || "-"}<br/>
                Цена: ${plot.price || "-"}<br/>
                Статус: <span style="color:${
                  isFree ? "green" : isSold ? "red" : "gray"
                }">${displayStatus}</span><br/>
                ${
                  isFree
                    ? `<button class="book-btn" data-plot="${plot.id}"
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

        polygon.events.add("mouseenter", () => {
          if (!isSelected) polygon.options.set("fillColor", hoverColor);
        });
        polygon.events.add("mouseleave", () => {
          if (!isSelected) polygon.options.set("fillColor", baseColor);
        });
        polygon.events.add("balloonopen", () => {
          isSelected = true;
          polygon.options.set("fillColor", hoverColor);
        });
        polygon.events.add("balloonclose", () => {
          isSelected = false;
          polygon.options.set("fillColor", baseColor);
        });

        myMap.geoObjects.add(polygon);
        polys.push({ polygon, status: statusNorm, queue: plot.queue });
      });

      // Собираем bounds по очередям
      ["1 очередь", "2 очередь", "3 очередь"].forEach((queue) => {
        const qPolys = polys.filter((p) => p.queue === queue).map((p) => p.polygon);
        if (qPolys.length) {
          byQueue[queue] = window.ymaps.geoQuery(qPolys).getBounds();
        }
      });

      setQueueBounds(byQueue);
      setPolygons(polys);

      // Общие границы
      if (polys.length) {
        const bounds = window.ymaps.geoQuery(myMap.geoObjects).getBounds();
        allBoundsRef.current = bounds;
        myMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
      }
    });
  }, [plots]);

  // 2) Клик по кнопке в балуне
  useEffect(() => {
    const onDocClick = (e) => {
      const btn = e.target.closest && e.target.closest(".book-btn");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const id = btn.getAttribute("data-plot");
      if (id) {
        setSelectedPlot(id);
        try {
          map?.balloon?.close();
        } catch {}
      }
    };

    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [map]);

  // 3) Фильтры
  useEffect(() => {
    polygons.forEach(({ polygon, status }) => {
      polygon.options.set("visible", !!filters[status]);
    });
  }, [filters, polygons]);

  const goToQueue = (queue) => {
    if (map && queueBounds[queue]) {
      setActiveQueue(queue);
      map.setBounds(queueBounds[queue], {
        checkZoomRange: true,
        zoomMargin: 40,
        duration: 500,
      });
    }
  };

  const goToAll = () => {
    if (map && allBoundsRef.current) {
      setActiveQueue(null);
      map.setBounds(allBoundsRef.current, {
        checkZoomRange: true,
        zoomMargin: 40,
        duration: 500,
      });
    }
  };

  const buttonStyle = (isActive) => ({
    flex: "0 0 auto",
    minWidth: "100px",
    padding: "8px 14px",
    backgroundColor: isActive ? "#28a745" : "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.2s, transform 0.2s",
  });

  return (
    <div style={{ position: "relative" }}>
      <div
        id="yandex-map-invest"
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      />

      {/* Панель кнопок + фильтры */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(6px)",
          padding: "10px",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          width: "90%",
          maxWidth: "500px",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            paddingBottom: "4px",
            overflowX:
              typeof window !== "undefined" && window.innerWidth < 600
                ? "auto"
                : "visible",
          }}
        >
          {["1 очередь", "2 очередь", "3 очередь"].map((queue, i) => (
            <button
              key={i}
              onClick={() => goToQueue(queue)}
              style={buttonStyle(activeQueue === queue)}
            >
              {queue}
            </button>
          ))}
          <button
            onClick={goToAll}
            style={{ ...buttonStyle(activeQueue === null), minWidth: "120px" }}
          >
            Все участки
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={filters["свободен"]}
              onChange={(e) =>
                setFilters({ ...filters, свободен: e.target.checked })
              }
            />{" "}
            Свободные
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters["продан"]}
              onChange={(e) =>
                setFilters({ ...filters, продан: e.target.checked })
              }
            />{" "}
            Проданные
          </label>
        </div>
      </div>

      {/* Модалка */}
      {selectedPlot && (
        <BookingModal
          plotId={selectedPlot}
          source="map-invest"
          onClose={() => setSelectedPlot(null)}
        />
      )}
    </div>
  );
}
