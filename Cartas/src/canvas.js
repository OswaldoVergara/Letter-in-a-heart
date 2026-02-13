// src/canvas.js
import { IS_DEVICE } from "./config.js";

export function setupCanvas(canvasId = "heart", initialQuality = {}) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  let quality = {
    koef: initialQuality.koef ?? (IS_DEVICE ? 0.75 : 1),
    dprCap: initialQuality.dprCap ?? (IS_DEVICE ? 1.75 : 2),
  };

  function resize() {
    // Tamaño visual
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";

    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(rawDpr, quality.dprCap);

    const cssW = innerWidth * quality.koef;
    const cssH = innerHeight * quality.koef;

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    // Dibuja en coordenadas tipo “CSS px”
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, cssW, cssH);
  }

  window.addEventListener("resize", resize);
  resize();

  return {
    canvas,
    ctx,
    rand: Math.random,
    getSize: () => ({
      width: innerWidth * quality.koef,
      height: innerHeight * quality.koef,
    }),
    getQuality: () => ({ ...quality }),
    setQuality: (q) => {
      quality = { ...quality, ...q };
      resize();
    },
  };
}
