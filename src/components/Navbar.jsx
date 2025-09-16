import React, { useEffect, useState } from "react";

export default function Navbar() {
  const links = [
    { label: "Главная", href: "#hero" },
    { label: "Участки", href: "#lots" },
    { label: "О нас", href: "#stats" },
    { label: "Контакты", href: "#contact" },
  ];

  const [active, setActive] = useState("#hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100; // небольшое смещение для заголовков
      let current = "#hero";

      links.forEach((link) => {
        const section = document.querySelector(link.href);
        if (section && section.offsetTop <= scrollPos) {
          current = link.href;
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/25 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-green-600">LandSite</div>
        <ul className="flex gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`transition ${
                  active === link.href
                    ? "text-green-600 font-semibold underline underline-offset-4"
                    : "text-gray-800 hover:text-green-600"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
