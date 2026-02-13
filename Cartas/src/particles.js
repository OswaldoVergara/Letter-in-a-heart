import { TRACE_COUNT, CONFIG, IS_DEVICE } from "./config.js";

export function createParticles(count, width, height, rand) {
  const e = new Array(count);

  for (let i = 0; i < count; i++) {
    const x = rand() * width;
    const y = rand() * height;

    e[i] = {
      vx: 0,
      vy: 0,
      speed: rand() + 5,
      q: ~~(rand() * count),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + 0.7,
      f:
        "hsla(0," +
        ~~(40 * rand() + 100) +
        "%," +
        ~~(60 * rand() + 20) +
        "%,.35)",
      trace: [],
    };

    for (let k = 0; k < TRACE_COUNT; k++) e[i].trace[k] = { x, y };
  }

  return e;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function stepParticles(
  ctx,
  particles,
  targetPoints,
  rand,
  options = {},
) {
  const mode = options.mode ?? "heart";
  const heartPointsCount = targetPoints.length;
  if (heartPointsCount === 0) return;

  const contourTargets = options.contourTargets ?? null;
  const contourCount = options.contourCount ?? 0;
  const contourOffset = options.contourOffset ?? 0;

  const dot = IS_DEVICE ? 2 : 1;

  for (let i = particles.length; i--; ) {
    const u = particles[i];

    const isContour = contourTargets && i < contourCount;

    // target
    const q = isContour
      ? contourTargets[(i + (contourOffset | 0)) % contourTargets.length]
      : targetPoints[u.q % heartPointsCount];

    const dx = u.trace[0].x - q[0];
    const dy = u.trace[0].y - q[1];
    const length = Math.sqrt(dx * dx + dy * dy) || 1e-6;

    // Random-walk solo para corazón (no contorno)
    if (mode === "heart" && length < 10 && !isContour) {
      if (0.95 < rand()) {
        u.q = ~~(rand() * heartPointsCount);
      } else {
        if (0.99 < rand()) u.D *= -1;
        u.q = (u.q + u.D) % heartPointsCount;
        if (u.q < 0) u.q += heartPointsCount;
      }
    }

    // física
    u.vx += (-dx / length) * u.speed;
    u.vy += (-dy / length) * u.speed;

    u.trace[0].x += u.vx;
    u.trace[0].y += u.vy;

    u.vx *= u.force;
    u.vy *= u.force;

    // suaviza cola
    for (let k = 0; k < u.trace.length - 1; ) {
      const T = u.trace[k];
      const N = u.trace[++k];
      N.x -= CONFIG.traceK * (N.x - T.x);
      N.y -= CONFIG.traceK * (N.y - T.y);
    }

    // render
    if (isContour) {
      const tailLen = Math.min(u.trace.length, IS_DEVICE ? 18 : 26);
      const dot2 = IS_DEVICE ? 2 : 2; // contorno un poquito más visible

      for (let k = tailLen - 1; k >= 0; k--) {
        const p = u.trace[k];
        const t = k / (tailLen - 1); // 0 cabeza, 1 cola

        const r = 255;
        const g = (60 + (255 - 60) * t) | 0;
        const b = (60 + (255 - 60) * t) | 0;

        // Mucho más visible
        const a = 1.0 - 0.85 * t; // cabeza ~1, cola ~0.15

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(p.x, p.y, dot2, dot2);
      }
      continue;
    }

    // Corazón: estela con color normal
    ctx.fillStyle = u.f;
    for (let k = 0; k < u.trace.length; k++) {
      const p = u.trace[k];
      ctx.fillRect(p.x, p.y, dot, dot);
    }
  }
}
