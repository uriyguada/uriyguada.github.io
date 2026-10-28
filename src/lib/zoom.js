// En escritorio la página va con zoom (ver base.css). getBoundingClientRect y el puntero
// llegan sin zoom; lo que se escribe en style va en las unidades de adentro.
export function zoomActual() {
  return parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
}

export const aDentro = (n) => n / zoomActual();
