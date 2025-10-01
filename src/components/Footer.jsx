import { useLocation, useNavigate } from "react-router-dom";

export default function Footer() {
  const nav = useNavigate();
  const loc = useLocation();

  function scrollToId(id) {
    // если мы не на главной — перейдём на главную и попросим её проскроллить
    if (loc.pathname !== "/") {
      nav("/", { replace: false, state: { scrollTo: id } });
      return;
    }

    const el =
      document.getElementById(id) ||
      document.getElementById(`${id}-section`);
    if (!el) return;

    const header =
      document.querySelector("[data-sticky-header]") ||
      document.querySelector("header");
    const offset = header?.offsetHeight || 64;

    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  const LinkBtn = ({ to, children }) => (
    <button
      type="button"
      onClick={() => scrollToId(to)}
      className="text-gray-300 hover:text-white transition underline-offset-4 hover:underline"
    >
      {children}
    </button>
  );

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-white font-semibold text-lg mb-2">Столица Земли</div>
          <p className="text-sm opacity-80">
            Земельные участки: ИЖС, промышленные и инвестиционные.
          </p>
        </div>

        <div>
          <div className="text-white font-semibold mb-2">Навигация</div>
          <ul className="space-y-2 text-sm">
            <li><LinkBtn to="plots-section">Наши участки</LinkBtn></li>
            <li><LinkBtn to="map">Карта</LinkBtn></li>
            <li><LinkBtn to="faq">FAQ</LinkBtn></li>
            <li><LinkBtn to="contact">Контакты</LinkBtn></li>
          </ul>
        </div>

        <div>
          <div className="text-white font-semibold mb-2">Правовая информация</div>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacy" className="hover:text-white">Политика конфиденциальности</a></li>
            <li><a href="/consent" className="hover:text-white">Согласие на обработку ПДн</a></li>
          </ul>
        </div>

        <div>
          <div className="text-white font-semibold mb-2">Контакты</div>
          <div className="text-sm">
            Тел.: <a href="tel:+7..." className="hover:text-white">+7 ...</a><br />
            Email: <a href="mailto:info@stolitsa-zemli.ru" className="hover:text-white">info@stolitsa-zemli.ru</a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 text-xs text-center py-3 opacity-70">
        © {new Date().getFullYear()} Столица Земли
      </div>
    </footer>
  );
}
