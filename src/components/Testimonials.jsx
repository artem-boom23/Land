export default function Testimonials() {
  return (
    <section id="testimonials" className="py-28 bg-white px-6">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
        Отзывы наших клиентов
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-xl transition">
          <p className="text-gray-700 italic mb-6">
            “Я долго искал участок для строительства дома. Здесь всё сделали быстро и честно...”
          </p>
          <div className="flex items-center gap-4">
            <img src="/images/client1.jpg" className="w-14 h-14 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-900">Алексей Петров</p>
              <p className="text-sm text-gray-500">Москва</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-xl transition">
          <p className="text-gray-700 italic mb-6">
            “Понравилось, что все условия прозрачные. Нашёл участок у озера который невероятно понравился...”
          </p>
          <div className="flex items-center gap-4">
            <img src="/images/client1.jpg" className="w-14 h-14 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-900">Мария Иванова</p>
              <p className="text-sm text-gray-500">Санкт-Петербург</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-xl transition">
          <p className="text-gray-700 italic mb-6">
            “Команда помогла выбрать участок в правильном месте и подсказали по коммуникациям...”
          </p>
          <div className="flex items-center gap-4">
            <img src="/images/client1.jpg" className="w-14 h-14 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-900">Игорь Смирнов</p>
              <p className="text-sm text-gray-500">Казань</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
