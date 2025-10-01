// src/pages/admin/RequestsPage.jsx
import { useEffect, useState } from "react";
import { AdminAPI } from "../../admin/api";

export default function RequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await AdminAPI.getRequests();
      // ожидаем массив заявок; если приходит объект — попробуем .items
      const arr = Array.isArray(data) ? data : (data?.items || []);
      setItems(arr);
    } catch (e) {
      console.error(e);
      setErr("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id, status) {
    try {
      await AdminAPI.updateRequestStatus(id, { status });
      await load();
    } catch (e) {
      console.error(e);
      alert("Не удалось обновить статус");
    }
  }

  return (
    <div className="wrap">
      <h2>Заявки</h2>

      {loading && <p>Загрузка...</p>}
      {err && <p className="err">{err}</p>}

      {/* Desktop: таблица */}
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Участок</th>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Комментарий</th>
              <th>Статус</th>
              <th style={{ width: 220 }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.plotId || "-"}</td>
                <td>{r.name || "-"}</td>
                <td>{r.phone || "-"}</td>
                <td style={{ maxWidth: 400 }}>{r.comment || "-"}</td>
                <td>{r.status || "новая"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn btn-primary" onClick={() => setStatus(r.id, "в работе")}>В работу</button>
                    <button className="btn btn-success" onClick={() => setStatus(r.id, "закрыта")}>Закрыта</button>
                    <button className="btn btn-muted" onClick={() => setStatus(r.id, "отклонена")}>Отклонена</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#777" }}>
                  Заявок пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: карточки */}
      <div className="cards">
        {items.map((r) => (
          <div key={r.id} className="card">
            <div className="card-row"><b>ID:</b> {r.id}</div>
            <div className="card-row"><b>Участок:</b> {r.plotId || "-"}</div>
            <div className="card-row"><b>Имя:</b> {r.name || "-"}</div>
            <div className="card-row"><b>Телефон:</b> {r.phone || "-"}</div>
            <div className="card-row"><b>Комментарий:</b> {r.comment || "-"}</div>
            <div className="card-row"><b>Статус:</b> {r.status || "новая"}</div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => setStatus(r.id, "в работе")}>В работу</button>
              <button className="btn btn-success" onClick={() => setStatus(r.id, "закрыта")}>Закрыта</button>
              <button className="btn btn-muted" onClick={() => setStatus(r.id, "отклонена")}>Отклонена</button>
            </div>
          </div>
        ))}
        {!items.length && !loading && <div className="card card-empty">Заявок пока нет</div>}
      </div>

      <style>{`
        .wrap { }
        .err { color: crimson; }
        .table-wrap { overflow-x: auto; display: block; }
        .tbl { width: 100%; border-collapse: collapse; background: #fff; }
        .tbl th, .tbl td { padding: 10px; border: 1px solid #ececec; vertical-align: top; }

        .btn { padding: 8px 12px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; }
        .btn-primary { background: #0d6efd; color: #fff; }
        .btn-success { background: #198754; color: #fff; }
        .btn-muted { background: #f3f4f6; color: #111827; border-color: #e5e7eb; }

        .cards { display: none; }

        @media (max-width: 768px) {
          .table-wrap { display: none; }
          .cards { display: grid; gap: 10px; }
          .card {
            background: #fff; border: 1px solid #ececec; border-radius: 12px;
            padding: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.04);
          }
          .card-row { display: grid; grid-template-columns: 110px 1fr; gap: 8px; }
          .card-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        }
      `}</style>
    </div>
  );
}
