import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { href: "hero", label: "Главная" },
    { href: "properties", label: "Участки" },
    { href: "features", label: "Почему мы" },
    { href: "testimonials", label: "Отзывы" },
    { href: "map", label: "Карта" },
    { href: "faq", label: "FAQ" },
    { href: "contact", label: "Контакты" },
  ];

  // вычисляем реальную высоту header + небольшой запас
  const getHeaderOffset = () => {
    const h = document.querySelector("header");
    return (h?.offsetHeight || 72); // 12px зазор
  };

  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const handleNavClick = useCallback(
    (e, id) => {
      e.preventDefault();

      // Закрываем бургер, если открыт
      setIsOpen(false);

      // Если мы НЕ на главной — уходим на "/" и там проскроллим через state
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: id } });
        return;
      }

      // Если уже на главной — скроллим с учётом хедера
      scrollToId(id);
    },
    [location.pathname, navigate, scrollToId]
  );

  return (
    <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md shadow z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Логотип */}
        <a href="/" onClick={(e) => handleNavClick(e, "hero")} className="text-2xl font-bold text-green-700">
          LandSite
        </a>

        {/* Навигация для больших экранов */}
        <nav className="hidden md:flex space-x-8 font-semibold text-gray-800">
          {links.map((item) => (
            <a
              key={item.href}
              href={`#${item.href}`}
              onClick={(e) => handleNavClick(e, item.href)}
              className="relative group"
            >
              <span className="transition-colors group-hover:text-green-600">
                {item.label}
              </span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Бургер для мобилок */}
        <button
          className="md:hidden text-3xl text-gray-800"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Открыть меню"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Мобильное меню с анимацией */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="md:hidden bg-white/95 backdrop-blur-md shadow-lg absolute top-16 left-0 w-full z-40"
          >
            <ul className="flex flex-col space-y-6 py-8 px-6 text-lg font-semibold text-gray-800">
              {links.map((item) => (
                <li key={item.href}>
                  <a
                    href={`#${item.href}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
