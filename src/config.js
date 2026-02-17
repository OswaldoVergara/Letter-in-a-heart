export const IS_DEVICE =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    (navigator.userAgent || navigator.vendor || window.opera).toLowerCase(),
  );

export const KOEF = IS_DEVICE ? 0.75 : 1;
export const TRACE_COUNT = IS_DEVICE ? 20 : 50;
export const DR = IS_DEVICE ? 0.3 : 0.1;

export const CONFIG = {
  traceK: 0.4,
  timeDelta: 0.01,
};
