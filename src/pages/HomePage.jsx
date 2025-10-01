import Hero from "../components/Hero";
import Properties from "../components/Properties";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import MapSection from "../components/MapSection";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* 2-я секция: Наши участки */}
      <section id="plots-section">
        <Properties />
      </section>

      <section id="features">
        <Features />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <section id="map">
        <MapSection />
      </section>

      <section id="faq">
        <FAQ />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </>
  );
}
