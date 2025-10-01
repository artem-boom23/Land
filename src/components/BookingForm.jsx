// src/components/BookingForm.jsx
import { useEffect, useMemo, useState } from "react";
import InputMask from "react-input-mask";

/** Собираем набор возможных API-баз, чтобы форма сама нашла рабочий */
function getApiBases() {
  const bases = [];

  // 1) .env (прод)
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
    let v = String(import.meta.env.VITE_API_URL).trim();
    // уберём хвостевые слеши
    v = v.replace(/\/+$/, "");
    bases.push(v);
  }

  // 2) локалка node
  bases.push("http://localhost:3001/api", "http://127.0.0.1:3001/api");

  // 3) относительный (когда фронт и api под одним доменом за nginx)
  if (typeof window !== "undefined") {
    bases.push(`${window.location.origin}/api`, "/api");
  }

  // уникализируем, убираем пустое
  const uniq = [];
  for (const b of bases) {
    const s = (b || "").toString().trim();
    if (!s) continue;
    if (!uniq.includes(s)) uniq.push(s);
  }
  return uniq;
}

export default function BookingForm({
  source = "contact",
  plotId,
  submitText = "Отправить заявку",
  defaultValues = { name: "", phone: "", email: "", comment: "" },
  showCancel = false,
  onCancel,
}) {
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [apiReachable, setApiReachable] = useState(null); // null/true/false
  const [apiTried, setApiTried] = useState([]);
  const apiBases = useMemo(() => getApiBases(), []);

  const validate = (v) => {
    const e = {};
    if (!v.name || v.name.trim().length < 2) e.name = "Введите имя (мин. 2 символа)";
    if (!v.phone || v.phone.replace(/\D/g, "").length < 11) e.phone = "Введите корректный телефон";
    if (v.email && !/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(v.email)) e.email = "Введите корректный email";
    if (!agree) e.agree = "Требуется согласие на обработку персональных данных";
    return e;
  };

  // Лёгкий пинг API — покажем пользователю подсказку, если бек недоступен
  useEffect(() => {
    let disposed = false;
    (async () => {
      for (const base of apiBases) {
        try {
          // Лёгкий HEAD/GET к несущественному урлу (можно к /api/plots?category=industrial)
          const url = `${base}/send-form`;
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 2500);
          const resp = await fetch(url, { method: "OPTIONS", signal: ctrl.signal }).catch(() => null);
          clearTimeout(t);
          if (disposed) return;
          // Если CORS/OPTIONS прошёл (или сервер ответил 404/405) — значит база «живая»
          if (resp) {
            setApiReachable(true);
            setApiTried((prev) => (prev.includes(base) ? prev : [...prev, base]));
            return;
          }
        } catch (_) {
          /* noop, пробуем следующую базу */
        }
      }
      if (!disposed) setApiReachable(false);
    })();
    return () => { disposed = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function trySend(payload) {
    const tried = [];
    let lastErr = null;

    for (const base of apiBases) {
      const url = `${base.replace(/\/+$/, "")}/send-form`;
      tried.push(url);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // если сервер ответил, пытаемся разобрать
        const ct = res.headers.get("content-type") || "";
        const isJSON = ct.includes("application/json");
        const data = isJSON ? await res.json().catch(() => ({})) : await res.text();

        if (!res.ok) {
          // сервер ответил ошибкой — это не сеть; дадим понятное сообщение
          throw new Error(
            isJSON
              ? (data?.error || data?.message || `Ошибка API (${res.status})`)
              : `Ошибка API (${res.status}): ${String(data).slice(0, 200)}`
          );
        }
        // успех
        return { ok: true, data: isJSON ? data : { success: true } };
      } catch (e) {
        lastErr = e;
      }
    }

    return { ok: false, error: lastErr, tried };
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const form = new FormData(ev.currentTarget);
    const data = {
      name: form.get("name") || "",
      phone: form.get("phone") || "",
      email: form.get("email") || "",
      comment: form.get("comment") || "",
    };

    const valErr = validate(data);
    if (Object.keys(valErr).length) return setErrors(valErr);

    setErrors({});
    setLoading(true);

    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.comment, // сервер ждёт "message"
      source,
      plotId,
      consentAccepted: true,
    };

    const res = await trySend(payload);
    setLoading(false);

    if (res.ok) {
      setSent(true);
      return;
    }

    // Покажем подробную ошибку и куда пытались стукаться
    const msg = res.error?.message || "Сеть/сервер недоступен";
    alert(`Не удалось отправить заявку:\n${msg}\n\nПробовали:\n${(res.tried || []).join("\n")}`);
    // На всякий — лог в консоль для диагностики
    // eslint-disable-next-line no-console
    console.error("BookingForm send error:", res.error, "Tried:", res.tried);
  };

  if (sent) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold text-green-700 mb-2">Спасибо!</h3>
        <p className="text-gray-700">
          Ваша заявка {plotId ? <>по участку <b>{plotId}</b> </> : null}
          успешно отправлена. Мы свяжемся с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
      {plotId && (
        <div className="text-center text-gray-700">
          Участок: <span className="font-semibold">{plotId}</span>
        </div>
      )}

      {/* Подсказка, если API не пингуется (не критично, просто уведомление) */}
      {apiReachable === false && (
        <div className="text-sm p-2 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
          Сервер заявок пока недоступен. Проверьте, что бэкенд запущен на <code>http://localhost:3001</code> или задан <code>VITE_API_URL</code>.
        </div>
      )}

      <div>
        <input
          type="text"
          name="name"
          placeholder="Ваше имя"
          defaultValue={defaultValues.name}
          className="w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-green-600"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^А-Яа-яЁёA-Za-z\s-]/g, "");
          }}
          required
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <InputMask
          mask="+7 (999) 999-99-99"
          maskChar="_"
          name="phone"
          placeholder="Телефон"
          defaultValue={defaultValues.phone}
          className="w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-green-600"
          required
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email (необязательно)"
          defaultValue={defaultValues.email}
          className="w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-green-600"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <textarea
        name="comment"
        placeholder="Комментарий"
        defaultValue={defaultValues.comment}
        className="w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-green-600"
        rows="3"
      />

      {/* Чекбокс согласия */}
      <label className="flex gap-2 items-start">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          required
        />
        <span className="text-sm leading-5 text-gray-700">
          Я соглашаюсь с{" "}
          <a className="text-green-700 underline" href="/privacy" target="_blank" rel="noreferrer">
            Политикой конфиденциальности
          </a>{" "}
          и даю{" "}
          <a className="text-green-700 underline" href="/consent" target="_blank" rel="noreferrer">
            Согласие на обработку персональных данных
          </a>.
        </span>
      </label>
      {errors.agree && <p className="text-red-500 text-sm -mt-2">{errors.agree}</p>}

      <div className="flex justify-end gap-2">
        {showCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
            Отмена
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2 sm:py-3 rounded-lg text-base sm:text-lg"
        >
          {loading ? "Отправляем..." : submitText}
        </button>
      </div>
    </form>
  );
}
