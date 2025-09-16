export default function FAQ() {
  const faqs = [
    { q: "Как оформить покупку участка?", a: "Мы помогаем с полным юридическим сопровождением сделки." },
    { q: "Можно ли купить в ипотеку?", a: "Да, мы работаем с банками-партнёрами." },
    { q: "Где посмотреть документы?", a: "Все документы доступны по запросу, полностью прозрачно." },
  ];

  return (
    <section id="faq" className="py-28 bg-white px-6">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
        Часто задаваемые вопросы
      </h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((item, i) => (
          <details key={i} className="p-6 border rounded-2xl shadow-md">
            <summary className="cursor-pointer font-semibold text-lg">{item.q}</summary>
            <p className="mt-3 text-gray-700">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
