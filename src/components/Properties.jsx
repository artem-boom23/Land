import { useEffect, useState, useRef } from "react";
import { fetchPublicPlots } from "../admin/api";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import imgLand1 from "../assets/images/land1.jpg";
import imgLand2 from "../assets/images/land2.jpg";
import imgLand3 from "../assets/images/land3.jpg";
import imgIzhs from "../assets/images/IMG_0729.jpg";

// ===== Счётчик =====
function Counter({ value, duration = 1.5 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.floor(latest));

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [value, duration, motionValue, isInView]);

  return (
    <motion.span ref={ref} className="font-semibold">
      {rounded}
    </motion.span>
  );
}

// ===== Основной компонент =====
export default function Properties() {
  const [industrialStats, setIndustrialStats] = useState(null);

  useEffect(() => {
    const load = import.meta.env.DEV
      ? () => fetch("/plots.json").then((r) => r.json())
      : () => fetchPublicPlots("industrial");
    load()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        const total = list.length;
        const free = list.filter((p) => p.status === "Свободен").length;
        const sold = list.filter((p) => p.status === "Продан").length;
        setIndustrialStats({ total, free, sold });
      })
      .catch(() => {});
  }, []);

  const categories = [
    {
      id: "industrial",
      title: "Промышленные участки",
      description: industrialStats ? (
        <>
          Доступно <Counter value={industrialStats.free} /> из{" "}
          <Counter value={industrialStats.total} />
        </>
      ) : (
        "Загрузка данных..."
      ),
      link: "/plots/industrial",
      highlight: true,
      image: imgLand1,
    },
    {
      id: "izhs",
      title: "ИЖС",
      description: "Скоро новые проекты",
      link: "/plots/izhs",
      highlight: false,
      image: imgLand3,
    },
    {
      id: "recri",
      title: "Рекреация - туризм",
      description: "В разработке",
      link: "/plots/invest",
      highlight: false,
      image: imgIzhs,
    },
    {
      id: "invest",
      title: "Инвестиционные участки",
      description: "В разработке",
      link: "/plots/invest",
      highlight: false,
      image: imgLand2,
    },
  ];

  return (
    <section className="py-20 bg-gray-50" id="plots">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-16">
          Наши участки
        </h2>

        <div className="grid gap-8 sm:grid-cols-2">
          {categories.map((cat, i) => (
            <TiltCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Карточка с 3D-наклоном и zoom-фоном =====
function TiltCard({ category: cat, index }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((offsetY - centerY) / centerY) * 8;
    const rotateY = -((offsetX - centerX) / centerX) * 8;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group rounded-2xl overflow-hidden shadow-xl transition-all duration-500"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: "transform 0.2s ease-out",
        transformStyle: "preserve-3d",
        boxShadow: "0 0 25px rgba(0,0,0,0.2)",
      }}
    >
      {/* Glow border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: cat.highlight
            ? "0 0 30px 5px rgba(34,197,94,0.6)"
            : "0 0 25px 3px rgba(156,163,175,0.5)",
        }}
      />

      {/* Фон */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 rounded-2xl"
        style={{ backgroundImage: `url(${cat.image})` }}
      />

      {/* Градиент */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl"></div>

      {/* Контент */}
      {cat.highlight ? (
        <Link
          to={cat.link}
          className="relative z-10 p-8 flex flex-col h-full justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-3">
              {cat.title}
            </h3>
            <div className="text-gray-200 text-lg">{cat.description}</div>
          </div>
          <span className="mt-6 inline-block px-6 py-3 rounded-lg text-center font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/50 transition-all duration-300">
            Смотреть
          </span>
        </Link>
      ) : (
        <div className="relative z-10 p-8 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-3">
              {cat.title}
            </h3>
            <p className="text-gray-200 text-lg">{cat.description}</p>
          </div>
          <span className="mt-6 inline-block px-6 py-3 rounded-lg text-center font-semibold bg-gray-500/70 text-gray-200 cursor-default">
            Скоро
          </span>
        </div>
      )}
    </motion.div>
  );
}
