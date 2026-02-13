// src/input.js
export function bindTap(element, onTap) {
  const handler = (ev) => {
    ev.preventDefault?.();
    onTap();
  };

  // pointerdown funciona en desktop + móvil
  element.addEventListener("pointerdown", handler, { passive: false });

  // Por si algún navegador raro no dispara pointer events
  element.addEventListener("touchstart", handler, { passive: false });
  element.addEventListener("mousedown", handler, { passive: false });

  return () => {
    element.removeEventListener("pointerdown", handler);
    element.removeEventListener("touchstart", handler);
    element.removeEventListener("mousedown", handler);
  };
}
