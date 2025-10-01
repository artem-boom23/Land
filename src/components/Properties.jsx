import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";

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
    fetch("/plots.json")
      .then((res) => res.json())
      .then((data) => {
        const total = data.length;
        const free = data.filter((p) => p.status === "Свободен").length;
        const sold = data.filter((p) => p.status === "Продан").length;
        setIndustrialStats({ total, free, sold });
      });
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
    image: "/images/land1.jpg",
  },
  {
    id: "izhs",
    title: "ИЖС",
    description: "Скоро новые проекты",
    link: "/plots/izhs",
    highlight: false,
    image: "/images/land3.jpg",
  },
  {
    id: "invest",
    title: "Инвестиционные участки",
    description: "В разработке",
    link: "/plots/invest",
    highlight: false,
    image: "/images/land2.jpg",
  },
];


  return (
    <section className="py-20 bg-gray-50" id="plots">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-16">
          Наши участки
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
            ? "0 0 30px 5px rgba(34,197,94,0.6)" // зелёный glow
            : "0 0 25px 3px rgba(156,163,175,0.5)", // серый glow
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
      <Link
        to={cat.highlight ? cat.link : "#"}
        className="relative z-10 p-8 flex flex-col h-full justify-between"
      >
        <div>
          <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-3">
            {cat.title}
          </h3>
          {typeof cat.description === "string" ? (
            <p className="text-gray-200 text-lg">{cat.description}</p>
          ) : (
            <div className="text-gray-200 text-lg">{cat.description}</div>
          )}
        </div>

        <span
          className={`mt-6 inline-block px-6 py-3 rounded-lg text-center font-semibold transition-all duration-300 ${
            cat.highlight
              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/50"
              : "bg-gray-500 text-gray-200 cursor-not-allowed"
          }`}
        >
          {cat.highlight ? "Смотреть" : "Скоро"}
        </span>
      </Link>
    </motion.div>
  );
}










// import { Link } from "react-router-dom";

// const lands = [
//   { id: 1, title: "Первая очередь", price: "Доступно: 26 участков", img: "/images/land1.jpg" },
//   { id: 2, title: "Вторая очередь", price: "Доступно: 77 участков", img: "/images/land2.jpg" },
//   { id: 3, title: "Третья очередь", price: "Доступно: 1 участок", img: "/images/land3.jpg" },
//   ];

// export default function Properties() {
//   return (
//     <section
//       id="properties"
//       className="py-28 bg-gray-50 px-6 scroll-mt-24 md:scroll-mt-28"
//     >
//       <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
//         Наши участки
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
//         {lands.map((land) => (
//           <div
//             key={land.id}
//             className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition group cursor-pointer"
//           >
//             <img
//               src={land.img}
//               alt={land.title}
//               className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition"></div>

//             <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
//               <h3 className="text-2xl font-bold text-white mb-2">
//                 {land.title}
//               </h3>
//               <p className="text-green-300 font-semibold mb-4">{land.price}</p>
//               <Link
//                 to={`/property/${land.id}`}
//                 className="bg-green-600 text-white px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
//               >
//                 Подробнее...
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
