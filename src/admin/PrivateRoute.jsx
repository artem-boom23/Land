// src/admin/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
  // читаем токен из localStorage
  let token = "";
  try {
    token = localStorage.getItem("token_raw") || localStorage.getItem("token") || "";
  } catch {}

  const isAuthed = Boolean((token || "").trim());
  const loc = useLocation();

  // нет токена — отправляем на логин и передаём "откуда пришли"
  if (!isAuthed) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
  }

  // есть токен — показываем вложенные страницы админки
  return <Outlet />;
}
