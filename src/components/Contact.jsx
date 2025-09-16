export default function Contact() {
  return (
    <section id="contact" className="py-28 bg-gray-50 px-6">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
        Свяжитесь с нами
      </h2>
      <form className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-lg space-y-6">
        <input
          type="text"
          placeholder="Ваше имя"
          className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <input
          type="email"
          placeholder="Ваш email"
          className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <textarea
          rows="5"
          placeholder="Ваше сообщение"
          className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
        ></textarea>
        <button
          type="submit"
          className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}
