import { useParams, useNavigate } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";

const properties = [
  {
    id: 1,
    title: "Участок у озера",
    price: "1 200 000 ₽",
    description:
      "Прекрасный участок у озера с видом на лес. Отлично подходит для дачи и загородного отдыха.",
    images: ["/images/land1.jpg", "/images/land2.jpg"],
    features: {
      Площадь: "15 соток",
      Коммуникации: "Электричество, газ, вода",
      Удалённость: "20 км от МКАД",
      Назначение: "ИЖС",
    },
  },
  {
    id: 2,
    title: "Участок в лесу",
    price: "900 000 ₽",
    description:
      "Уютный участок в окружении соснового леса. Идеально для строительства дома и тихой жизни.",
    images: ["/images/land3.jpg", "/images/land1.jpg"],
    features: {
      Площадь: "10 соток",
      Коммуникации: "Электричество, скважина",
      Удалённость: "35 км от города",
      Назначение: "Дачное строительство",
    },
  },
  {
    id: 3,
    title: "Участок у реки",
    price: "1 500 000 ₽",
    description:
      "Участок в живописном месте прямо у реки. Отлично подойдёт для загородного дома или базы отдыха.",
    images: ["/images/land2.jpg", "/images/land3.jpg"],
    features: {
      Площадь: "20 соток",
      Коммуникации: "Электричество, газ",
      Удалённость: "50 км от города",
      Назначение: "ИЖС",
    },
  },
  {
    id: 4,
    title: "Участок в деревне",
    price: "750 000 ₽",
    description:
      "Участок в тихой деревне с дружелюбными соседями. Отличный бюджетный вариант для дачи.",
    images: ["/images/land1.jpg", "/images/land2.jpg"],
    features: {
      Площадь: "8 соток",
      Коммуникации: "Электричество",
      Удалённость: "60 км от города",
      Назначение: "ЛПХ",
    },
  },
];

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const property = properties.find((p) => p.id.toString() === id);

  if (!property) {
    return <h2 className="text-center mt-20">Участок не найден</h2>;
  }

  return (
    <div className="max-w-6xl mx-auto px-15 pt-5 pb-0">
      {/* Заголовок и кнопка "Назад" в одну строку */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">{property.title}</h1>
        <button
          onClick={() => navigate("/", { state: { scrollTo: "properties" } })}
          className="bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-700 transition"
        >
          ← Назад
        </button>
      </div>

      {/* Цена */}
      <p className="text-green-600 text-2xl font-semibold mb-8">
        {property.price}
      </p>

      {/* Фото */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {property.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={property.title}
            className="rounded-xl shadow-lg object-cover"
          />
        ))}
      </div>

      {/* Описание */}
      <p className="text-gray-700 text-lg mb-10">{property.description}</p>

      {/* Характеристики */}
      <h2 className="text-2xl font-bold mb-6">Характеристики участка</h2>
      <div className="overflow-x-auto mb-12">
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
          <tbody>
            {Object.entries(property.features).map(([key, value], i) => (
              <tr key={i} className="odd:bg-gray-50 even:bg-white">
                <td className="py-4 px-6 font-semibold text-gray-800 border">
                  {key}
                </td>
                <td className="py-4 px-6 text-gray-600 border">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Форма заявки */}
      <PropertyForm plotId={property.id} />
    </div>
  );
}