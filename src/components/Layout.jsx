import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import CookieConsent from "./CookieConsent";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      <ScrollToTop />
      <Footer />
      <CookieConsent />
    </>
  );
}
