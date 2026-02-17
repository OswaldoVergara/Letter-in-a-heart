import "./raf.js";
import { CONFIG, IS_DEVICE } from "./config.js";
import { setupCanvas } from "./canvas.js";
import { buildHeartOrigins, pulseTargets } from "./heart.js";
import { createParticles, stepParticles } from "./particles.js";
import { bindTap } from "./input.js";
import { buildSingleLineContourTargets } from "./targets_text.js";

let loaded = false;

function init() {
  if (loaded) return;
  loaded = true;

  // Calidad inicial recomendada (A35 target)
  const api = setupCanvas("heart", {
    koef: IS_DEVICE ? 0.75 : 1,
    dprCap: IS_DEVICE ? 1.75 : 2,
  });

  const { canvas, ctx, rand, getSize } = api;
  const pointsOrigin = buildHeartOrigins();

  const { width: w0, height: h0 } = getSize();
  const particles = createParticles(pointsOrigin.length, w0, h0, rand);

  // 10 pasos de texto (una línea por click)
  const LINES = [
    "Hola mi Musarañita",
    "Hoy quiero recordarte",
    "Lo mucho que te quiero",
    "Que quiero pasar",
    "Más que estos 4 años contigo,",
    "Quiero estar toda una vida",
    "Me siento orgulloso",
    "De todo lo que eres y haces",
    "Y del amor que hemos cultivado",
    "Te amo ❤️",
  ];

  const PHASES = ["heart", ...LINES, "heart"];
  let phaseIndex = 0;

  bindTap(canvas, () => {
    phaseIndex = (phaseIndex + 1) % PHASES.length;
    document.title = `Phase ${phaseIndex + 1}/${PHASES.length}`;
    cachedLine = ""; // invalida cache para recalcular contorno si toca
  });

  // --- FPS AUTO QUALITY ---
  let frames = 0;
  let lastFpsT = performance.now();
  let smoothedFps = 60;

  function adjustQualityIfNeeded(fps) {
    if (!IS_DEVICE) return;

    const q = api.getQuality();

    if (fps < 45) {
      api.setQuality({
        koef: Math.max(0.55, q.koef - 0.05),
        dprCap: Math.max(1.25, q.dprCap - 0.1),
      });
    } else if (fps > 57) {
      api.setQuality({
        koef: Math.min(0.85, q.koef + 0.03),
        dprCap: Math.min(2.0, q.dprCap + 0.05),
      });
    }
  }

  // Cache del contorno (para NO recalcular cada frame)
  let cachedLine = "";
  let cachedW = 0;
  let cachedH = 0;
  let contourTargets = null;

  const CONTOUR_COUNT = IS_DEVICE ? 700 : 1000;

  function getContourTargets(line, w, h) {
    if (
      line === cachedLine &&
      Math.abs(w - cachedW) < 1 &&
      Math.abs(h - cachedH) < 1 &&
      contourTargets
    ) {
      return contourTargets;
    }

    cachedLine = line;
    cachedW = w;
    cachedH = h;

    contourTargets = buildSingleLineContourTargets({
      line,
      width: w,
      height: h,
      particleCount: CONTOUR_COUNT,
      fontSize: IS_DEVICE ? 38 : 52,
      sampleStep: IS_DEVICE ? 2 : 1,
      strokeWidthFactor: 0.045,
      alphaThreshold: 70,
      bold: true,
    });
    return contourTargets;
  }

  let time = 0;
  let contourOffset = 0;

  function loop() {
    const now = performance.now();
    frames++;

    if (now - lastFpsT >= 1000) {
      const fps = (frames * 1000) / (now - lastFpsT);
      frames = 0;
      lastFpsT = now;
      smoothedFps = smoothedFps * 0.7 + fps * 0.3;
      adjustQualityIfNeeded(smoothedFps);
    }

    const { width: w, height: h } = getSize();

    // Corazón (targets)
    const n = -Math.cos(time);
    const k = (1 + n) * 0.5;
    const heartTargets = pulseTargets(pointsOrigin, w, h, k, k);

    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * CONFIG.timeDelta;

    // Limpieza de fondo (estela)
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, w, h);

    const phase = PHASES[phaseIndex];
    const isHeartOnly = phase === "heart";

    let contour = null;
    if (!isHeartOnly) {
      contour = getContourTargets(phase, w, h);
      contourOffset =
        (contourOffset + (IS_DEVICE ? 1.0 : 1.6)) % contour.length;
    }

    stepParticles(ctx, particles, heartTargets, rand, {
      mode: "heart",
      contourTargets: contour,
      contourCount: isHeartOnly ? 0 : CONTOUR_COUNT,
      contourOffset,
    });

    // Solo si NO es fase corazón, dibujamos texto real encima
    if (!isHeartOnly) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${IS_DEVICE ? 34 : 44}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // RELLENO (rojo suave)
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillText(phase, w / 2, h / 2);

      // CONTORNO (rojo)
      ctx.lineWidth = IS_DEVICE ? 1.1 : 1.6;
      ctx.strokeStyle = "rgba(255,60,60,0.7)";
      ctx.strokeText(phase, w / 2, h / 2);

      contourOffset = (contourOffset + (IS_DEVICE ? 1.0 : 1.6)) % CONTOUR_COUNT;
      ctx.restore();
    }

    // Texto real por contraste (encima, centrado)
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${IS_DEVICE ? 36 : 48}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = IS_DEVICE ? 3 : 4;
    ctx.strokeStyle = "rgba(255,60,60,0.92)";
    //ctx.strokeText(line, w / 2, h / 2);
    ctx.restore();

    window.requestAnimationFrame(loop, canvas);
  }

  loop();
}

const s = document.readyState;
if (s === "complete" || s === "loaded" || s === "interactive") init();
else document.addEventListener("DOMContentLoaded", init, false);
