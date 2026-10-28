// Hero: el logo animado de Uri & Guada y "DUPLA CREATIVA". Nada más.
import { dupla } from '../data/proyectos.js';

// Safari (y todo iOS) no muestra la transparencia de un webm: ahí va la versión en WebP animado.
const ua = navigator.userAgent;
const sinAlfaEnWebm =
  /iP(hone|ad|od)/.test(ua) ||
  (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android|CriOS|FxiOS/.test(ua));

const MEDIDAS = {
  horizontal: '1920 / 806',
  vertical: '1400 / 1223',
};

function estatico(variante) {
  const img = new Image();
  img.src = variante === 'vertical' ? '/logo/uri-y-guada-vertical-crema.svg' : '/logo/uri-y-guada-crema.svg';
  img.alt = '';
  return img;
}

function animado(variante) {
  if (sinAlfaEnWebm) {
    const img = new Image();
    img.src = `/logo/uri-y-guada-${variante}.webp`;
    img.alt = '';
    return img;
  }
  const video = document.createElement('video');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = 'auto';
  video.src = `/logo/uri-y-guada-${variante}.webm`;
  // si el navegador no puede con el webm, queda el logo quieto
  video.addEventListener('error', () => video.replaceWith(marcar(estatico(variante), variante)));
  video.play().catch(() => {});
  return video;
}

function marcar(el, variante) {
  el.className = `hero__animacion hero__animacion--${variante}`;
  el.setAttribute('aria-hidden', 'true');
  el.style.aspectRatio = MEDIDAS[variante];
  return el;
}

export function montarHero(seccion) {
  seccion.innerHTML = `
    <div class="hero__interior">
      <h1 class="hero__logo"><span class="sr">${dupla.nombre}</span></h1>
      <p class="hero__bajada adv">${dupla.bajada}</p>
    </div>
  `;

  const logo = seccion.querySelector('.hero__logo');
  const mq = window.matchMedia('(max-width: 720px)');
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const poner = () => {
    const variante = mq.matches ? 'vertical' : 'horizontal';
    logo.querySelector('.hero__animacion')?.remove();
    const el = reducido ? estatico(variante) : animado(variante);
    logo.prepend(marcar(el, variante));
  };

  poner();
  mq.addEventListener('change', poner);
}
