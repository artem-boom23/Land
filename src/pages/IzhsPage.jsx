// src/pages/IzhsPage.jsx
import { useEffect, useState } from "react";
import PlotsMap from "../components/PlotsMap";

export default function IzhsPage() {
  const [plots, setPlots] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/plots?category=izhs")
      .then((r) => r.json())
      .then((data) => setPlots(data.items || []))
      .catch((err) => console.error("Ошибка загрузки участков:", err));
  }, []);

  return (
    <section className="pt-16 px-4">
      <h2 className="text-2xl font-bold text-green-700 text-center mb-4">
        Участки ИЖС
      </h2>
      <div className="w-full max-w-6xl mx-auto">
        <PlotsMap plots={plots} />
      </div>
    </section>
  );
}
