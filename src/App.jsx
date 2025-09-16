import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Properties from "./components/Properties";
import Testimonials from "./components/Testimonials";
import MapSection from "./components/MapSection";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: top -10, // тут задаём смещение вниз (можно увеличить)
          behavior: "smooth",
        });
      }
    }
  }, [location]);

  return null;
}


export default function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <Hero />
      <Properties />
      <Features />
      <Testimonials />
      <MapSection />
      <FAQ />
      <Contact />
    </>
  );
}
