export default function MapSection() {
  return (
    <section id="map" className="py-28 bg-gray-50 px-6">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
        Где находятся наши участки
      </h2>
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22551.505969423088!2d38.975577127933434!3d45.04647500882309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40f04f9c2224cafb%3A0x5c1c5247a63a9634!2z0JPQsNC70LXRgNC10Y8g0JrRgNCw0YHQvdC-0LTQsNGA!5e0!3m2!1sru!2sru!4v1757671017255!5m2!1sru!2sru"
          width="100%"
          height="500"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </section>
  );
}
