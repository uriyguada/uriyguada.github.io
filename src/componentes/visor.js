// Visor: las 8 fichas una al lado de la otra. Se pasa de una a otra en horizontal,
// sin recargar nada. Abre y cierra con un barrido circular desde la entrada que se rompió.
import { proyectos } from '../data/proyectos.js';
import { fichaHTML, montarFicha } from './ficha.js';

const SEPARACION = 40;

export function montarVisor({ alCerrar } = {}) {
  const visor = document.createElement('div');
  visor.className = 'visor';
  visor.hidden = true;
  visor.innerHTML = `
    <div class="visor__pista">${proyectos.map(fichaHTML).join('')}</div>
    <button type="button" class="visor__cerrar" aria-label="Cerrar">✕</button>
    <div class="visor__pildora">
      <button type="button" class="visor__flecha" data-paso="-1" aria-label="Función anterior">←</button>
      <span class="mono visor__contador">01 / 08</span>
      <button type="button" class="visor__flecha" data-paso="1" aria-label="Próxima función">→</button>
    </div>`;
  document.body.append(visor);

  const pista = visor.querySelector('.visor__pista');
  const paneles = [...visor.querySelectorAll('.panel')];
  const contador = visor.querySelector('.visor__contador');
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let i = 0;
  let abierto = false;
  let slugOrigen = null;
  let ancho = 0;

  paneles.forEach((panel, k) => {
    montarFicha(panel, proyectos[k], { irA: (slug) => irA(slug) });
    panel.addEventListener('click', (e) => {
      if (k === i || e.target.closest('button, a')) return;
      ir(k);
    });
  });

  function medir() {
    const w = window.innerWidth;
    ancho = w <= 720 ? w - 24 : Math.min(1180, w - 260);
    visor.style.setProperty('--panel-ancho', `${ancho}px`);
    // todo lo de adentro de la ficha se mide contra el panel, no contra la ventana
    visor.style.setProperty('--esc', ((ancho / 1180) * 0.75).toFixed(3));
    colocar(false);
  }

  function colocar(conTransicion = true) {
    const x = window.innerWidth / 2 - ancho / 2 - i * (ancho + SEPARACION);
    pista.style.transition = conTransicion && !reducido() ? '' : 'none';
    pista.style.transform = `translateX(${x}px)`;
    if (!conTransicion) requestAnimationFrame(() => (pista.style.transition = ''));
  }

  function pintar() {
    paneles.forEach((p, k) => {
      p.classList.toggle('panel--activo', k === i);
      p.setAttribute('aria-hidden', String(k !== i));
      p.querySelector('.panel__scroll').tabIndex = k === i ? 0 : -1;
    });
    contador.textContent = `${proyectos[i].n} / ${String(proyectos.length).padStart(2, '0')}`;
  }

  function ir(k, { empujarUrl = false } = {}) {
    const total = proyectos.length;
    i = ((k % total) + total) % total;
    colocar(true);
    pintar();
    paneles[i].querySelector('.panel__scroll').scrollTop = 0;
    const url = `#/funcion/${proyectos[i].slug}`;
    if (abierto) {
      if (empujarUrl) history.pushState({ visor: true }, '', url);
      else history.replaceState({ visor: true }, '', url);
    }
  }

  function irA(slug) {
    const k = proyectos.findIndex((p) => p.slug === slug);
    if (k >= 0) ir(k);
  }

  function abrir(slug, origen) {
    const k = proyectos.findIndex((p) => p.slug === slug);
    if (k < 0) return;
    slugOrigen = slug;
    i = k;
    visor.hidden = false;
    document.body.classList.add('con-visor');
    medir();
    pintar();
    abierto = true;
    history.pushState({ visor: true }, '', `#/funcion/${slug}`);

    if (origen && !reducido()) {
      const { x, y } = origen;
      visor.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      requestAnimationFrame(() => {
        visor.style.transition = 'clip-path .6s cubic-bezier(.65,0,.2,1)';
        visor.style.clipPath = `circle(140% at ${x}px ${y}px)`;
      });
      setTimeout(() => {
        visor.style.transition = '';
        visor.style.clipPath = '';
      }, 650);
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
    const terminar = () => {
      visor.hidden = true;
      visor.style.transition = '';
      visor.style.clipPath = '';
      document.body.classList.remove('con-visor');
      if (slugOrigen && alCerrar) alCerrar(slugOrigen);
      slugOrigen = null;
    };

    if (reducido()) {
      terminar();
      return;
    }
    const entrada = slugOrigen && document.querySelector(`.entrada[data-slug="${slugOrigen}"]`);
    const r = entrada ? entrada.getBoundingClientRect() : null;
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
    visor.style.transition = 'clip-path .5s cubic-bezier(.65,0,.2,1)';
    visor.style.clipPath = `circle(140% at ${x}px ${y}px)`;
    requestAnimationFrame(() => {
      visor.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    });
    setTimeout(terminar, 520);
  }

  // ---- controles ----
  visor.querySelector('.visor__cerrar').addEventListener('click', () => cerrar());
  visor.querySelectorAll('[data-paso]').forEach((b) =>
    b.addEventListener('click', () => ir(i + Number(b.dataset.paso)))
  );

  window.addEventListener('keydown', (e) => {
    if (!abierto) return;
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
    const dx = e.clientX - gesto.x0;
    const dy = e.clientY - gesto.y0;
    if (!gesto.eje) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      gesto.eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (gesto.eje === 'x') pista.style.transition = 'none';
    }
    if (gesto.eje !== 'x') return;
    gesto.dx = dx;
    const base = window.innerWidth / 2 - ancho / 2 - i * (ancho + SEPARACION);
    pista.style.transform = `translateX(${base + dx * 0.9}px)`;
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
  // por si la ventana cambia de tamaño sin disparar resize (rotar el teléfono, barra del navegador)
  if ('ResizeObserver' in window) new ResizeObserver(() => medir()).observe(document.documentElement);

  window.addEventListener('popstate', () => {
    const slug = (location.hash.match(/^#\/funcion\/(.+)$/) || [])[1];
    if (slug) {
      if (!abierto) abrir(slug, null);
      else irA(slug);
    } else if (abierto) {
      cerrar({ volverUrl: false });
    }
  });

  // entrar directo a una URL abre el visor en esa ficha
  const inicial = (location.hash.match(/^#\/funcion\/(.+)$/) || [])[1];
  if (inicial && proyectos.some((p) => p.slug === inicial)) {
    abrir(inicial, null);
  }

  return { abrir, cerrar, irA };
}
