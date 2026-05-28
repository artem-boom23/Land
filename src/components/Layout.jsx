import { useLayoutEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import CookieConsent from "./CookieConsent";
import { useLocation } from "react-router-dom";

if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = "";
  }, [pathname]);

  const mainPad = isHome ? "pt-0" : "pt-16";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className={`min-h-[60vh] flex-1 ${mainPad} pb-24 bg-gray-50`}>
        {children}
      </main>
      <ScrollToTop />
      <Footer />
      <CookieConsent />
    </div>
  );
}

// export default function Layout({ children }) {
//   return (
//     <>
//       <Header />
//       <main className="min-h-[60vh]  pt-19 pb-24 bg-gray-50">{children}</main>
//       <ScrollToTop />
//       <Footer />
//       <CookieConsent />
//     </>
//   );
// }
