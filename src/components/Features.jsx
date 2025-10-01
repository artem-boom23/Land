import { ShieldCheck, FileCheck, BarChart3, Layers, Zap, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <Layers className="w-10 h-10 text-green-600" />,
    title: "Вертикальная интеграция",
    text: "Все процессы внутри компании, без посредников.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-green-600" />,
    title: "Гарантии",
    text: "Мы сопровождаем сделки юридически и берём на себя все согласования.",
  },
  {
    icon: <FileCheck className="w-10 h-10 text-green-600" />,
    title: "Прозрачность",
    text: "Открытая отчётность и доступ к ключевым документам.",
  },
  {
    icon: <Zap className="w-10 h-10 text-green-600" />,
    title: "Гибкость",
    text: "Быстрые решения и адаптация к рынку.",
  },
  {
    icon: <BarChart3 className="w-10 h-10 text-green-600" />,
    title: "Надёжность",
    text: "Участки всегда передаются с коммуникациями и полным пакетом документов.",
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-green-600" />,
    title: "Рост инвестиций",
    text: "Стоимость земли в наших проектах растёт на 200–400% благодаря девелоперской модели.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-green-700 mb-12">
          Почему выбирают нас
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
