export default function Hero() {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-white text-center">
      <video
        autoPlay
        loop
        muted
        className="absolute w-full h-full object-cover"
      >
        <source src="/media/drone.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Земля для вашего будущего</h1>
        <p className="text-lg md:text-2xl mb-8">Лучшие участки в живописных местах</p>
        <a
          href="#properties"
          className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-full text-white font-semibold transition"
        >
          Смотреть участки
        </a>
      </div>
    </section>
  );
}
