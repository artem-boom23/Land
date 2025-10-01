export default function NotFound() {
  return (
    <main style={{ minHeight: "50vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 42, marginBottom: 8 }}>Страница не найдена</h1>
        <p>Перейти на <a href="/">главную</a> или в <a href="/plots/izhs">каталог участков</a>.</p>
      </div>
    </main>
  );
}
