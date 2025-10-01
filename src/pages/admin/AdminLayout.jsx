// src/pages/admin/AdminLayout.jsx
import { Outlet, NavLink } from "react-router-dom";
import { clearToken } from "../../admin/api";

export default function AdminLayout() {
  function handleLogout() {
    try {
      clearToken();
      localStorage.removeItem("token_raw");
    } catch {}
    // Полный переход на главную
    window.location.assign("/");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f9" }}>
      <header className="admin-header">
        <div className="admin-header__row">
          <div className="admin-brand">
            <span className="admin-logo">Админ-панель</span>
          </div>

          <nav className="admin-nav">
            <NavLink to="/admin/requests" className="admin-link">
              Заявки
            </NavLink>
            <NavLink to="/admin/plots" className="admin-link">
              Участки
            </NavLink>
          </nav>

          <div className="admin-actions">
            <button className="btn-ghost" onClick={handleLogout}>Выйти</button>
          </div>
        </div>
      </header>

      <section className="admin-content">
        <Outlet />
      </section>

      {/* Лёгкие стили, в т.ч. адаптив под мобилку */}
      <style>{`
        .admin-header {
          position: sticky; top: 0; z-index: 10;
          background: #ffffff; border-bottom: 1px solid #ececec;
        }
        .admin-header__row {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr auto auto; gap: 12px;
          align-items: center; padding: 10px 16px;
        }
        .admin-brand { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
        .admin-logo { font-weight: 700; letter-spacing: .3px; }
        .admin-sub { color: #6c757d; font-size: 12px; }
        .admin-nav { display: flex; gap: 10px; flex-wrap: wrap; }
        .admin-link {
          padding: 8px 12px; border-radius: 8px; text-decoration: none; color: #0d6efd;
          background: #f2f6ff; border: 1px solid #dfe8ff;
        }
        .admin-link.active { background: #0d6efd; color: #fff; border-color: #0d6efd; }
        .admin-actions { display: flex; justify-content: end; }
        .btn-ghost {
          padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e7eb;
          background: #fff; color: #111827; cursor: pointer;
        }
        .btn-ghost:hover { background: #f9fafb; }

        .admin-content { max-width: 1200px; margin: 0 auto; padding: 16px; }

        /* Мобилки */
        @media (max-width: 768px) {
          .admin-header__row {
            grid-template-columns: 1fr; gap: 8px;
          }
          .admin-nav {
            order: 3; gap: 8px;
          }
          .admin-actions {
            order: 2; justify-content: flex-start;
          }
          .admin-content { padding: 12px; }
        }
      `}</style>
    </main>
  );
}
