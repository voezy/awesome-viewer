type ThrottleCB = (...args: unknown[]) => unknown

export function throttle(cb: ThrottleCB, time = 100) {
  let lastTime: number;
  return function(...args: unknown[]) {
    const now = Date.now();
    if (!lastTime || now - lastTime > time) {
      lastTime = now;
      return cb(...args);
    }
  };
}
