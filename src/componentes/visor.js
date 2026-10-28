// Visor: las 8 fichas una al lado de la otra. Se pasa de una a otra en horizontal
// (arrastrando, con la rueda o con las flechas del teclado), sin recargar nada.
// Sube desde abajo como una sola pieza y baja al cerrarse.
import { proyectos } from '../data/proyectos.js';
import { fichaHTML, montarFicha } from './ficha.js';
import { sonar } from '../lib/sonido.js';
import { zoomActual } from '../lib/zoom.js';

const SEPARACION = 40;

export function montarVisor() {
  const visor = document.createElement('div');
  visor.className = 'visor';
  visor.hidden = true;
  visor.innerHTML = `
    <div class="visor__fondo"></div>
    <div class="visor__escena"><div class="visor__pista">${proyectos.map(fichaHTML).join('')}</div></div>
    <button type="button" class="visor__cerrar" aria-label="Cerrar"><span></span><span></span></button>`;
  document.body.append(visor);

  const pista = visor.querySelector('.visor__pista');
  const paneles = [...visor.querySelectorAll('.panel')];
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let i = 0;
  let abierto = false;
  let ancho = 0;

  paneles.forEach((panel, k) => {
    montarFicha(panel, proyectos[k], { irA: (slug) => irA(slug) });
    panel.addEventListener('click', (e) => {
      if (k === i || e.target.closest('button, a')) return;
      ir(k);
    });
  });

  const anchoVentana = () => window.innerWidth / zoomActual();

  function medir() {
    const w = anchoVentana();
    ancho = window.innerWidth <= 720 ? w - 24 : Math.min(1180, w - 260);
    visor.style.setProperty('--panel-ancho', `${ancho}px`);
    // todo lo de adentro de la ficha se mide contra el panel, no contra la ventana
    visor.style.setProperty('--esc', ((ancho / 1180) * 0.75).toFixed(3));
    colocar(false);
  }

  const base = () => anchoVentana() / 2 - ancho / 2 - i * (ancho + SEPARACION);

  function colocar(conTransicion = true) {
    pista.style.transition = conTransicion && !reducido() ? '' : 'none';
    pista.style.transform = `translateX(${base()}px)`;
    if (!conTransicion) requestAnimationFrame(() => (pista.style.transition = ''));
  }

  function pausarVideos(panel) {
    for (const p of panel ? [panel] : paneles) {
      for (const video of p.querySelectorAll('video')) if (!video.paused) video.pause();
    }
  }

  function pintar() {
    paneles.forEach((p, k) => {
      p.classList.toggle('panel--activo', k === i);
      // solo se pintan la activa y sus dos vecinas: el resto no gasta nada
      p.classList.toggle('panel--vecino', Math.abs(k - i) === 1 || Math.abs(k - i) === paneles.length - 1);
      p.setAttribute('aria-hidden', String(k !== i));
      p.querySelector('.panel__scroll').tabIndex = k === i ? 0 : -1;
    });
  }

  function ir(k) {
    const total = proyectos.length;
    const siguiente = ((k % total) + total) % total;
    if (siguiente === i) return;
    pausarVideos(paneles[i]);
    i = siguiente;
    sonar('pasar');
    colocar(true);
    pintar();
    paneles[i].querySelector('.panel__scroll').scrollTop = 0;
    if (abierto) history.replaceState({ visor: true }, '', `#/funcion/${proyectos[i].slug}`);
  }

  function irA(slug) {
    const k = proyectos.findIndex((p) => p.slug === slug);
    if (k >= 0) ir(k);
  }

  function abrir(slug, { conSonido = true } = {}) {
    const k = proyectos.findIndex((p) => p.slug === slug);
    if (k < 0 || abierto) return;
    i = k;
    abierto = true;
    if (conSonido) sonar('abrir');
    visor.classList.remove('visor--bajando');
    visor.hidden = false;
    document.body.classList.add('con-visor');
    medir();
    pintar();
    paneles[i].querySelector('.panel__scroll').scrollTop = 0;
    const destino = `#/funcion/${slug}`;
    if (location.hash === destino) history.replaceState({ visor: true }, '', destino);
    else history.pushState({ visor: true }, '', destino);

    if (!reducido()) {
      visor.classList.add('visor--subiendo');
      // un frame para que arranque desde abajo; después sube
      requestAnimationFrame(() => requestAnimationFrame(() => visor.classList.remove('visor--subiendo')));
    }
    paneles[i].querySelector('.panel__scroll').focus({ preventScroll: true });
  }

  function cerrar({ volverUrl = true } = {}) {
    if (!abierto) return;
    // Volver atrás es lo que cierra: así el botón Atrás del navegador no reabre la ficha.
    if (volverUrl && location.hash.startsWith('#/funcion/')) {
      history.back();
      return;
    }
    abierto = false;
    pausarVideos();
    sonar('cerrar');
    const terminar = () => {
      visor.hidden = true;
      visor.classList.remove('visor--bajando');
      document.body.classList.remove('con-visor');
    };
    if (reducido()) {
      terminar();
      return;
    }
    visor.classList.add('visor--bajando');
    setTimeout(terminar, 420);
  }

  // ---- controles ----
  visor.querySelector('.visor__cerrar').addEventListener('click', () => cerrar());

  window.addEventListener('keydown', (e) => {
    if (!abierto || document.body.classList.contains('con-lupa')) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowRight') ir(i + 1);
    if (e.key === 'ArrowLeft') ir(i - 1);
  });

  // rueda horizontal y shift + rueda
  let freno = 0;
  visor.addEventListener(
    'wheel',
    (e) => {
      if (!abierto) return;
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      const ahora = Date.now();
      if (ahora - freno < 600 || Math.abs(dx) < 18) return;
      freno = ahora;
      ir(i + (dx > 0 ? 1 : -1));
    },
    { passive: false }
  );

  // arrastre con bloqueo de eje: si el gesto arranca vertical, scrollea la ficha
  let gesto = null;
  pista.addEventListener('pointerdown', (e) => {
    if (!abierto || e.target.closest('button, a, .repro__linea')) return;
    gesto = { x0: e.clientX, y0: e.clientY, eje: null, dx: 0, id: e.pointerId };
  });

  window.addEventListener('pointermove', (e) => {
    if (!gesto || e.pointerId !== gesto.id) return;
    const z = zoomActual();
    const dx = (e.clientX - gesto.x0) / z;
    const dy = (e.clientY - gesto.y0) / z;
    if (!gesto.eje) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      gesto.eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (gesto.eje === 'x') pista.style.transition = 'none';
    }
    if (gesto.eje !== 'x') return;
    gesto.dx = dx;
    pista.style.transform = `translateX(${base() + dx * 0.9}px)`;
  });

  function soltarGesto() {
    if (!gesto) return;
    const { eje, dx } = gesto;
    gesto = null;
    if (eje !== 'x') return;
    pista.style.transition = '';
    if (Math.abs(dx) > Math.min(140, ancho * 0.18)) ir(i + (dx < 0 ? 1 : -1));
    else colocar(true);
  }
  window.addEventListener('pointerup', soltarGesto);
  window.addEventListener('pointercancel', soltarGesto);

  window.addEventListener('resize', medir);
  if ('ResizeObserver' in window) new ResizeObserver(() => medir()).observe(document.documentElement);

  window.addEventListener('popstate', () => {
    const slug = (location.hash.match(/^#\/funcion\/(.+)$/) || [])[1];
    if (slug) {
      if (!abierto) abrir(slug, { conSonido: false });
      else irA(slug);
    } else if (abierto) {
      cerrar({ volverUrl: false });
    }
  });

  // entrar directo a una URL abre el visor en esa ficha
  const inicial = (location.hash.match(/^#\/funcion\/(.+)$/) || [])[1];
  if (inicial && proyectos.some((p) => p.slug === inicial)) abrir(inicial, { conSonido: false });

  return { abrir, cerrar, irA };
}
