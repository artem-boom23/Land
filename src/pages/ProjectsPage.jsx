export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-10 text-green-700">Реализованные проекты</h1>

      <p className="text-lg text-gray-700 mb-12">
        За годы работы наша команда реализовала ряд успешных проектов, где каждая очередь — это новый шаг в развитии инфраструктуры и промышленности.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-bold text-green-700 mb-4">1-я очередь</h2>
          <p className="text-gray-700">
            40 гектаров, из которых уже продано 38,5 га под мебельное производство, фабрику одежды,
            завод металлоконструкций, производство башенных кранов и другие предприятия.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-bold text-green-700 mb-4">2-я очередь</h2>
          <p className="text-gray-700">
            Находится в активной реализации. Подготовлены площадки для новых предприятий.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-bold text-green-700 mb-4">3-я очередь</h2>
          <p className="text-gray-700">
            Открыта для инвестиций. Возможность войти на ранней стадии и получить максимальную доходность.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-bold text-green-700 mb-4">4-я очередь</h2>
          <p className="text-gray-700">
            70 гектаров, готовится к запуску. Включает перспективные площадки для крупных производств.
          </p>
        </div>
      </div>
    </div>
  );
}
