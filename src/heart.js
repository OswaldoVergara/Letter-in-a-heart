import { DR } from "./config.js";

function heartPosition(rad) {
  return [
    Math.pow(Math.sin(rad), 3),
    -(
      15 * Math.cos(rad) -
      5 * Math.cos(2 * rad) -
      2 * Math.cos(3 * rad) -
      Math.cos(4 * rad)
    ),
  ];
}

function scaleAndTranslate(pos, sx, sy, dx, dy) {
  return [dx + pos[0] * sx, dy + pos[1] * sy];
}

// (líneas 62–72)
export function buildHeartOrigins() {
  const pointsOrigin = [];
  for (let i = 0; i < Math.PI * 2; i += DR)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
  for (let i = 0; i < Math.PI * 2; i += DR)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
  for (let i = 0; i < Math.PI * 2; i += DR)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
  return pointsOrigin;
}

// (líneas 74–80)
export function pulseTargets(pointsOrigin, width, height, kx, ky) {
  const targetPoints = new Array(pointsOrigin.length);
  for (let i = 0; i < pointsOrigin.length; i++) {
    targetPoints[i] = [
      kx * pointsOrigin[i][0] + width / 2,
      ky * pointsOrigin[i][1] + height / 2,
    ];
  }
  return targetPoints;
}
