export function getTransformValue(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const matrix = style.transform;
  const transformValue = {
    translateX: 0,
    translateY: 0,
  };
  const result = /matrix.*\((.+)\)/.exec(matrix);
  if (result) {
    const values = result[1].split(', ');
    transformValue.translateX = Number(values[4]);
    transformValue.translateY = Number(values[5]);
  }
  return transformValue;
}
