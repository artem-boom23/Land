// src/components/SmoothScrollLink.jsx
export default function SmoothScrollLink({
  to,                // id целевой секции (без #)
  children,
  offset = 0,        // доп. отступ сверху (если есть фиксированная шапка)
  className = "",
  ...rest
}) {
  function handleClick(e) {
    e.preventDefault();
    const target = document.getElementById(to);
    if (!target) return;

    const header = document.querySelector("[data-sticky-header]");
    const headerH = header ? header.offsetHeight : 0;

    const top = target.getBoundingClientRect().top + window.scrollY - headerH - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <a href={`#${to}`} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}
