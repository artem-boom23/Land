// src/pages/admin/PlotsPage.jsx
import { useEffect, useState } from "react";
import { AdminAPI } from "../../admin/api";

export default function PlotsPage() {
  const [plots, setPlots] = useState([]);
  const [category, setCategory] = useState("industrial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingPlot, setEditingPlot] = useState(null);
  const [editForm, setEditForm] = useState({
    queue: "",
    status: "Свободен",
    area: "",
    price: "",
    coords: "",
  });

  useEffect(() => {
    loadPlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function loadPlots() {
    setLoading(true);
    setError("");
    try {
      const res = await AdminAPI.getPlots(category);
      setPlots(res.items || []);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить участки");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveInline(id, field, value) {
    try {
      await AdminAPI.updatePlot(id, { [field]: value }, category);
      await loadPlots();
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении");
    }
  }

  async function handleAdd() {
    try {
      const newPlot = {
        id: `plot-${Date.now()}`,
        queue: "",
        status: "Свободен",
        area: "",
        price: "",
        coords: [],
        category,
      };
      await AdminAPI.addPlot(newPlot, category);
      await loadPlots();
    } catch (err) {
      console.error(err);
      alert("Не удалось добавить участок");
    }
  }

  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm(`Удалить участок ${id}? Действие необратимо.`);
    if (!ok) return;
    try {
      await AdminAPI.deletePlot(id, category);
      await loadPlots();
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить участок");
    }
  }

  function openEdit(plot) {
    setEditingPlot(plot);
    setEditForm({
      queue: plot.queue || "",
      status: (plot.status || "Свободен").toString(),
      area: plot.area || "",
      price: plot.price || "",
      coords: JSON.stringify(plot.coords || [], null, 2),
    });
  }

  function closeEdit() { setEditingPlot(null); }
  function onEditChange(field, value) { setEditForm((p) => ({ ...p, [field]: value })); }

  async function saveEdit() {
    if (!editingPlot) return;
    const payload = {
      queue: editForm.queue,
      status: editForm.status,
      area: editForm.area,
      price: editForm.price,
    };
    try {
      const parsed = JSON.parse(editForm.coords || "[]");
      if (Array.isArray(parsed)) payload.coords = parsed;
    } catch {}
    try {
      await AdminAPI.updatePlot(editingPlot.id, payload, category);
      await loadPlots();
      closeEdit();
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить изменения");
    }
  }

  return (
    <div className="wrap">
      <h2>Участки — админка</h2>

      <div className="toolbar">
        {["industrial", "izhs", "invest"].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`btn ${category === c ? "btn-primary" : "btn-muted"}`}
          >
            {c === "industrial" ? "Промышленные" : c === "izhs" ? "ИЖС" : "Инвестиционные"}
          </button>
        ))}
        <button className="btn btn-success" onClick={handleAdd} title="Добавить участок">
          ➕ Добавить
        </button>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="err">{error}</p>}

      {/* Desktop: таблица */}
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Очередь</th>
              <th>Статус</th>
              <th>Площадь</th>
              <th>Цена</th>
              <th>Категория</th>
              <th style={{ width: 240 }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {plots.map((plot) => (
              <tr key={plot.id}>
                <td>{plot.id}</td>
                <td>
                  <input
                    value={plot.queue || ""}
                    onChange={(e) => handleSaveInline(plot.id, "queue", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={(plot.status || "Свободен").toString()}
                    onChange={(e) => handleSaveInline(plot.id, "status", e.target.value)}
                  >
                    <option value="Свободен">Свободен</option>
                    <option value="Продан">Продан</option>
                    <option value="Бронь">Бронь</option>
                    <option value="Дорога">Дорога</option>
                  </select>
                </td>
                <td>
                  <input
                    value={plot.area || ""}
                    onChange={(e) => handleSaveInline(plot.id, "area", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={plot.price || ""}
                    onChange={(e) => handleSaveInline(plot.id, "price", e.target.value)}
                  />
                </td>
                <td>{plot.category || category}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-primary" onClick={() => openEdit(plot)}>
                      ✏️ Редактировать
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(plot.id)}
                      title="Удалить участок"
                    >
                      🗑 Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!plots.length && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#777" }}>
                  Нет данных для категории «{category}»
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: карточки */}
      <div className="cards">
        {plots.map((p) => (
          <div key={p.id} className="card">
            <div className="card-row"><b>ID:</b> {p.id}</div>
            <div className="card-row">
              <b>Очередь:</b>
              <input
                value={p.queue || ""}
                onChange={(e) => handleSaveInline(p.id, "queue", e.target.value)}
              />
            </div>
            <div className="card-row">
              <b>Статус:</b>
              <select
                value={(p.status || "Свободен").toString()}
                onChange={(e) => handleSaveInline(p.id, "status", e.target.value)}
              >
                <option value="Свободен">Свободен</option>
                <option value="Продан">Продан</option>
                <option value="Бронь">Бронь</option>
                <option value="Дорога">Дорога</option>
              </select>
            </div>
            <div className="card-row">
              <b>Площадь:</b>
              <input
                value={p.area || ""}
                onChange={(e) => handleSaveInline(p.id, "area", e.target.value)}
              />
            </div>
            <div className="card-row">
              <b>Цена:</b>
              <input
                value={p.price || ""}
                onChange={(e) => handleSaveInline(p.id, "price", e.target.value)}
              />
            </div>
            <div className="card-row"><b>Категория:</b> {p.category || category}</div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => openEdit(p)}>✏️ Редактировать</button>
              <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>🗑 Удалить</button>
            </div>
          </div>
        ))}
        {!plots.length && !loading && (
          <div className="card card-empty">Нет данных для «{category}»</div>
        )}
      </div>

      {/* Модалка редактирования */}
      {editingPlot && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Редактирование участка: {editingPlot.id}</h3>

            <div className="grid2">
              <label className="field">
                <span>Очередь</span>
                <input
                  value={editForm.queue}
                  onChange={(e) => onEditChange("queue", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Статус</span>
                <select
                  value={editForm.status}
                  onChange={(e) => onEditChange("status", e.target.value)}
                >
                  <option value="Свободен">Свободен</option>
                  <option value="Продан">Продан</option>
                  <option value="Бронь">Бронь</option>
                  <option value="Дорога">Дорога</option>
                </select>
              </label>

              <label className="field">
                <span>Площадь</span>
                <input
                  value={editForm.area}
                  onChange={(e) => onEditChange("area", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Цена</span>
                <input
                  value={editForm.price}
                  onChange={(e) => onEditChange("price", e.target.value)}
                />
              </label>
            </div>

            <label className="field" style={{ marginTop: 12 }}>
              <span>Координаты (JSON: [[lat, lon], ...])</span>
              <textarea
                rows={8}
                value={editForm.coords}
                onChange={(e) => onEditChange("coords", e.target.value)}
                style={{ fontFamily: "monospace" }}
              />
            </label>

            <div className="modal-actions">
              <button className="btn btn-muted" onClick={closeEdit}>Отмена</button>
              <button className="btn btn-primary" onClick={saveEdit}>💾 Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* локальные стили + адаптив */}
      <style>{`
        .wrap { padding: 0; }
        .toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 16px; }
        .btn { padding: 8px 12px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; }
        .btn-muted { background: #f3f4f6; color: #111827; border-color: #e5e7eb; }
        .btn-primary { background: #0d6efd; color: #fff; }
        .btn-success { background: #198754; color: #fff; }
        .btn-danger { background: #dc3545; color: #fff; }
        .err { color: crimson; }

        .actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .table-wrap { overflow-x: auto; display: block; }
        .tbl { width: 100%; border-collapse: collapse; background: #fff; }
        .tbl th, .tbl td { padding: 10px; border: 1px solid #ececec; }
        .tbl input, .tbl select { width: 100%; min-width: 120px; }

        /* Карточки для мобилок */
        .cards { display: none; }

        /* Модалка */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.4);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal {
          background: #fff; padding: 16px; border-radius: 12px; width: min(780px, 95vw);
          max-height: 90vh; overflow: auto; box-shadow: 0 10px 30px rgba(0,0,0,.2);
        }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }

        @media (max-width: 920px) {
          .grid2 { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .table-wrap { display: none; }
          .cards { display: grid; gap: 10px; }
          .card {
            background: #fff; border: 1px solid #ececec; border-radius: 12px;
            padding: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.04);
          }
          .card-row { display: grid; grid-template-columns: 110px 1fr; gap: 8px; align-items: center; }
          .card-row input, .card-row select { width: 100%; }
          .card-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
        }
      `}</style>
    </div>
  );
}
