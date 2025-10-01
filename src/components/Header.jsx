import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserShield } from "react-icons/fa"; // 🛡 иконка админки

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const catRef = useRef(null);

  const categories = [
    { href: "/plots/izhs", label: "ИЖС" },
    { href: "/plots/industrial", label: "Промышленные" },
    { href: "/plots/invest", label: "Инвестиционные" },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md shadow-sm z-50 ${
        scrolled ? "bg-white shadow-md" : "bg-white/70 backdrop-blur-md shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-2 h-16 shrink-0">
          <img
            src="/images/new_logo2.svg"
            alt="ЛандМаркет"
            className="h-8 w-8 object-contain"
          />
          <span className="hidden sm:inline text-lg font-semibold tracking-tight text-gray-900">
            Столица Земли
          </span>
        </Link>

        {/* Навигация (Desktop) */}
        <nav className="hidden md:flex space-x-8 font-semibold text-gray-800 items-center">
          <Link
            to="/"
            className={`relative group ${
              isActive("/") ? "text-green-600" : "hover:text-green-600"
            }`}
          >
            Главная
            {isActive("/") && (
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-green-600"></span>
            )}
          </Link>

          {/* Категории (Desktop) */}
          <div className="relative" ref={catRef}>
            <button
              className={`flex items-center relative ${
                location.pathname.startsWith("/plots")
                  ? "text-green-600"
                  : "hover:text-green-600"
              }`}
              onClick={() => setIsCatOpen(!isCatOpen)}
            >
              Категории
              <motion.span
                className="ml-1"
                initial={false}
                animate={{ rotate: isCatOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
              {location.pathname.startsWith("/plots") && (
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-green-600"></span>
              )}
            </button>
            <AnimatePresence>
              {isCatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 w-56"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.href}
                      to={cat.href}
                      className={`block px-4 py-2 hover:bg-green-50 hover:text-green-600 ${
                        isActive(cat.href) ? "text-green-600 font-semibold" : ""
                      }`}
                      onClick={() => setIsCatOpen(false)}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/about"
            className={`relative group ${
              isActive("/about") ? "text-green-600" : "hover:text-green-600"
            }`}
          >
            О компании
            {isActive("/about") && (
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-green-600"></span>
            )}
          </Link>

          <Link
            to="/projects"
            className={`relative group ${
              isActive("/projects") ? "text-green-600" : "hover:text-green-600"
            }`}
          >
            Реализованные проекты
            {isActive("/projects") && (
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-green-600"></span>
            )}
          </Link>

          {/* 🔑 Иконка админки (Desktop) */}
          <Link
            to="/admin/login"
            className="ml-4 text-gray-600 hover:text-green-600"
            title="Админка"
          >
            <FaUserShield size={18} />
          </Link>
        </nav>

        {/* Бургер (Mobile) */}
        <button
          className="md:hidden text-3xl text-gray-800"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Открыть меню"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed top-16 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-40"
          >
            <ul className="flex flex-col space-y-6 py-8 px-6 text-lg font-semibold text-gray-800">
              <li>
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={isActive("/") ? "text-green-600" : ""}
                >
                  Главная
                </Link>
              </li>

              {/* Категории (Mobile) */}
              <li>
                <button
                  onClick={() => setIsCatOpen(!isCatOpen)}
                  className={`flex justify-between items-center w-full ${
                    location.pathname.startsWith("/plots")
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  Категории
                  <motion.span
                    className="ml-2"
                    initial={false}
                    animate={{ rotate: isCatOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isCatOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-2 space-y-2 pl-4"
                    >
                      {categories.map((cat) => (
                        <li key={cat.href}>
                          <Link
                            to={cat.href}
                            onClick={() => {
                              setIsOpen(false);
                              setIsCatOpen(false);
                            }}
                            className={`block px-2 py-2 rounded hover:bg-green-50 hover:text-green-600 ${
                              isActive(cat.href)
                                ? "text-green-600 font-semibold"
                                : ""
                            }`}
                          >
                            {cat.label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>

              <li>
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className={isActive("/about") ? "text-green-600" : ""}
                >
                  О компании
                </Link>
              </li>

              <li>
                <Link
                  to="/projects"
                  onClick={() => setIsOpen(false)}
                  className={isActive("/projects") ? "text-green-600" : ""}
                >
                  Реализованные проекты
                </Link>
              </li>

              {/* 🔑 Иконка админки (Mobile) */}
              <li>
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600"
                >
                  <FaUserShield /> Админка
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
