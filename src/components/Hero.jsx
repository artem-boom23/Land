import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "../assets/images/land1.jpg";

const VIDEO_SRC = "/media/drone_new.mp4";

export default function Hero() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToProperties = (e) => {
    e.preventDefault();

    // Если мы не на главной — перейдём на главную и там проскроллим
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "properties" } });
      return;
    }

    // Ищем целевую секцию (поддерживаем оба id на всякий случай)
    const el =
      document.getElementById("properties") ||
      document.getElementById("plots-section");
    if (!el) return;

    // Учитываем фиксированную шапку, если помечена data-sticky-header
    const header =
      document.querySelector("[data-sticky-header]") ||
      document.querySelector("header");
    const offset = header?.offsetHeight || 64;

    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative h-[calc(100vh-64px)] flex items-center justify-center text-white text-center mt-16"
    >
      {/* Видео фон */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        poster={heroBg}
      />


      {/* Overlay градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>

      {/* Контент */}
      <div className="relative z-10 px-6 max-w-3xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden sm:inline-block mb-4 px-4 py-1 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium tracking-wide uppercase"
        >
          Краснодарский край · Южный федеральный округ
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg"
        >
          Земля для вашего будущего
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-base sm:text-lg md:text-xl mb-8 drop-shadow text-white/90"
        >
          Найдите свой идеальный участок
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onClick={handleScrollToProperties}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-full text-white font-semibold transition"
        >
          Смотреть участки
        </motion.button>
      </div>

      {/* Волна-переход */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-[0] -mb-px md:mb-0 rotate-180">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-24 text-gray-50 block w-full md:translate-y-0"
          preserveAspectRatio="none"
        >
          <path
            d="M0,70 C400,120 1040,20 1440,80 L1440,0 L0,0 Z"
            className="fill-current"
          />
        </svg>
      </div>
    </section>
  );
}
