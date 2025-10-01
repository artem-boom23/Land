import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="text-gray-800 overflow-x-hidden">
      {/* Вступление + факты */}
      <section className="py-20 px-4 sm:px-6 bg-white border-b text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-green-700 mb-6"
        >
          О компании
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10"
        >
          <span className="font-semibold"> «Столица Земли»</span> создаёт индустриальные территории будущего — мы переводим земли, подводим коммуникации и выводим на рынок готовые площадки для бизнеса и инвестиций.
        </motion.p>

        {/* Карточки с фактами */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { value: "6+", label: "лет опыта" },
            { value: "450", label: "гектаров" },
            { value: "7", label: "очередей" },
            { value: "200–400%", label: "рост доходности" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl shadow-md p-6 text-center"
            >
              <p className="text-3xl sm:text-4xl font-bold text-green-600">
                {item.value}
              </p>
              <p className="text-sm sm:text-base text-gray-600">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Миссия */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.img
            src="/images/land1.jpg"
            alt="Миссия компании"
            className="rounded-2xl shadow-lg object-cover w-full h-56 sm:h-72 md:h-96"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-6">
              Наша миссия
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              Возрождать промышленную инфраструктуру России и создавать новые точки роста экономики.  
              Мы делаем качественные земельные участки доступными для заводов и инвесторов.
            </p>
          </motion.div>
        </div>
      </section>

      {/* История */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-6">
              История и результаты
            </h2>
            <ul className="space-y-3 text-base sm:text-lg md:text-xl list-disc pl-6">
              <li>
                <strong>1-я очередь</strong> — 40 га, реализованы проекты для мебельного производства, фабрики одежды и других предприятий.
              </li>
              <li><strong>2-я очередь</strong> — в активной реализации.</li>
              <li><strong>3-я очередь</strong> — открыта для инвестиций.</li>
              <li><strong>4-я очередь</strong> — 70 га, готовится к запуску.</li>
            </ul>
          </motion.div>
          <motion.img
            src="/images/land_wow.PNG"
            alt="История компании"
            className="rounded-2xl shadow-lg object-cover w-full h-56 sm:h-72 md:h-96"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
        </div>
      </section>

      {/* Команда */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-8 text-center"
          >
            Наша команда
          </motion.h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Юридический блок", text: "Перевод земли, сделки, защита инвесторов" },
              { title: "Инженеры", text: "Проектирование дорог, газ, электричество" },
              { title: "Маркетинг", text: "Вывод проектов на рынок, работа с клиентами" },
              { title: "Руководство", text: "10+ лет опыта в девелопменте" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow p-6 text-center"
              >
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Видение */}
      <motion.section
        className="py-20 px-4 sm:px-6 bg-white text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-6">
          Наше видение
        </h2>
        <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 mb-10">
          Мы стремимся стать лидером на рынке подготовки промышленных земель в{" "}
          <span className="font-semibold">Южном федеральном округе</span> и
          масштабировать проект на другие регионы страны.
        </p>
        <motion.img
          src="/images/land_road.PNG"
          alt="Наше видение"
          className="rounded-2xl shadow-lg object-cover w-full h-56 sm:h-72 md:h-96 mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />
      </motion.section>
    </div>
  );
}
