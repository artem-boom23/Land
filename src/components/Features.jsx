export default function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-white">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
        Почему выбирают нас
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition text-center">
          <p className="text-5xl font-extrabold text-green-600">600+</p>
          <p className="mt-3 text-gray-700 font-semibold">Участков в продаже</p>
        </div>
        <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition text-center">
          <p className="text-5xl font-extrabold text-green-600">20+</p>
          <p className="mt-3 text-gray-700 font-semibold">Лет опыта</p>
        </div>
        <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition text-center">
          <p className="text-5xl font-extrabold text-green-600">1000+</p>
          <p className="mt-3 text-gray-700 font-semibold">Довольных клиентов</p>
        </div>
      </div>
    </section>
  );
}
