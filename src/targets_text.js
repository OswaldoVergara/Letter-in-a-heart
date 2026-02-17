export function buildSingleLineContourTargets({
  line,
  width,
  height,
  particleCount,
  fontSize = 56,
  sampleStep = 2,
  bold = true,
  strokeWidthFactor = 0.075,
  alphaThreshold = 70,
}) {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(width));
  off.height = Math.max(1, Math.floor(height));
  const octx = off.getContext("2d", { willReadFrequently: true });

  const font = `${bold ? "700" : "400"} ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  octx.font = font;
  octx.textAlign = "center";
  octx.textBaseline = "middle";

  octx.clearRect(0, 0, off.width, off.height);

  const x = width / 2;
  const y = height / 2;

  octx.strokeStyle = "white";
  octx.lineWidth = Math.max(1, Math.floor(fontSize * strokeWidthFactor));
  octx.lineJoin = "round";
  octx.lineCap = "round";
  octx.strokeText(line, x, y);

  const img = octx.getImageData(0, 0, off.width, off.height).data;
  const pts = [];

  // scan order determinista: izquierda->derecha, arriba->abajo
  for (let yy = 0; yy < off.height; yy += sampleStep) {
    for (let xx = 0; xx < off.width; xx += sampleStep) {
      const idx = (yy * off.width + xx) * 4;
      const a = img[idx + 3];
      if (a > alphaThreshold) pts.push([xx, yy]);
    }
  }

  if (pts.length === 0)
    return new Array(particleCount).fill([width / 2, height / 2]);

  // muestreo uniforme para conservar “recorrido”
  const out = new Array(particleCount);
  const step = pts.length / particleCount;
  for (let i = 0; i < particleCount; i++) {
    out[i] = pts[Math.floor(i * step) % pts.length];
  }
  return out;
}
