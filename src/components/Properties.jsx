import { Link } from "react-router-dom";

const lands = [
  { id: 1, title: "Участок у озера", price: "1 200 000 ₽", img: "/images/land1.jpg" },
  { id: 2, title: "Участок в лесу", price: "900 000 ₽", img: "/images/land2.jpg" },
  { id: 3, title: "Участок у реки", price: "1 500 000 ₽", img: "/images/land3.jpg" },
  { id: 4, title: "Участок в деревне", price: "750 000 ₽", img: "/images/land3.jpg" },
];

export default function Properties() {
  return (
    <section
      id="properties"
      className="py-28 bg-gray-50 px-6 scroll-mt-24 md:scroll-mt-28"
    >
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
        Наши участки
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {lands.map((land) => (
          <div
            key={land.id}
            className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition group cursor-pointer"
          >
            <img
              src={land.img}
              alt={land.title}
              className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-2xl font-bold text-white mb-2">
                {land.title}
              </h3>
              <p className="text-green-300 font-semibold mb-4">{land.price}</p>
              <Link
                to={`/property/${land.id}`}
                className="bg-green-600 text-white px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                Подробнее...
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
