export default function MapSection() {
  return (
    <section id="map" className="py-28 bg-gray-50 px-6">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
        Где находятся наши участки
      </h2>
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d7039.891635192945!2d38.97144874558907!3d44.867609972112895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDTCsDUyJzA2LjEiTiAzOMKwNTgnMjguMiJF!5e1!3m2!1sru!2sru!4v1758100441853!5m2!1sru!2sru"
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
