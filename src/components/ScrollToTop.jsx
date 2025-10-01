import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout;

    const handleScroll = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          setVisible(window.scrollY > 300);
          timeout = null;
        }, 150); // throttle каждые 150ms
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 p-3 sm:p-4 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 focus:outline-none"
      aria-label="Прокрутить вверх"
    >
      ↑
    </motion.button>
  );
}
