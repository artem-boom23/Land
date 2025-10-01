import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Иван Петров",
    company: "Частный инвестор",
    text: "Купил участок под ИЖС — всё прозрачно, коммуникации уже были подведены. Очень доволен!",
    photo: "/images/client1.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Мария Смирнова",
    company: "Директор ООО «ТекстильПром»",
    text: "Инвестировала в промышленный участок, доходность превысила ожидания. Спасибо «ПромГород»!",
    photo: "",
    rating: 5,
  },
  {
    id: 3,
    name: "Алексей Иванов",
    company: "Руководитель девелоперского проекта",
    text: "Отличная команда, сопровождение сделки на высшем уровне. Буду рекомендовать коллегам.",
    photo: "/images/client2.jpg",
    rating: 4,
  },
  {
    id: 4,
    name: "Ольга Кузнецова",
    company: "Владелица мебельного производства",
    text: "Очень понравился сервис и отношение менеджеров. Сделка прошла быстро и комфортно.",
    photo: "",
    rating: 5,
  },
  {
    id: 5,
    name: "Сергей Лебедев",
    company: "Инвестор",
    text: "Вложил в землю как инвестор — отличный способ сохранить и приумножить капитал.",
    photo: "/images/client2.jpg",
    rating: 4,
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  // показываем 3 отзыва подряд
  const visible = [
    testimonials[index],
    testimonials[(index + 1) % testimonials.length],
    testimonials[(index + 2) % testimonials.length],
  ];

  // автопрокрутка каждые 7 секунд
  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        next();
      }, 7000);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused, index]);

  // функция для инициалов
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <section
      id="testimonials"
      className="py-20 bg-gray-50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2 className="text-4xl font-bold text-green-700 mb-12 text-center">
        Отзывы
      </h2>

      <div className="max-w-6xl mx-auto relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -100 || velocity.x < -500) {
                next();
              } else if (offset.x > 100 || velocity.x > 500) {
                prev();
              }
            }}
          >
            {visible.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-2xl shadow-lg flex flex-col"
              >
                {/* Шапка: аватар + имя + должность */}
                <div className="flex items-center mb-4">
                  {t.photo ? (
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-green-600"
                    />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-600 text-white text-lg font-bold border-2 border-green-600">
                      {getInitials(t.name)}
                    </div>
                  )}
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-green-700">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.company}</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-yellow-400 ${
                            i < t.rating ? "opacity-100" : "opacity-30"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Текст отзыва */}
                <p className="text-gray-700 italic">“{t.text}”</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Кнопки */}
        <div className="flex justify-center mt-10 space-x-6">
          <button
            onClick={prev}
            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            ›
          </button>
        </div>

        {/* Индикаторы */}
        <div className="flex justify-center mt-6 space-x-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition ${
                i === index
                  ? "bg-white border-2 border-green-600"
                  : "bg-white border border-gray-400 hover:border-green-400"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
