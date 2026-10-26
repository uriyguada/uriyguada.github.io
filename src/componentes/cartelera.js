// Cartelera: las 8 entradas. Al tocar una, se rompe por el troquel con sonido de papel
// y se abre su ficha. Nada aparece ni desaparece con fundido: todo se mueve.
import gsap from 'gsap';
import { proyectos } from '../data/proyectos.js';
import { sonarRotura } from '../lib/sonido.js';

function entradaHTML(p) {
  const t = p.ticket;
  return `
    <li class="cartelera__item">
      <button class="entrada no-arrastre" type="button" data-slug="${p.slug}" aria-label="Abrir ${p.titulo}"
              style="--color:${p.color};--tinta-entrada:${p.tinta};--giro:${t.rot}deg">
        <span class="entrada__cuerpo">
          <span class="entrada__papel">
            <span class="entrada__foto duo" style="background:${p.color}">
              <img src="${t.img}" alt="" loading="lazy" draggable="false" style="object-position:${t.pos}">
            </span>
            <span class="entrada__datos">
              <span class="entrada__meta mono"><span>FUNCIÓN ${p.n}</span><span>${p.marcaTicket}</span></span>
              <span class="entrada__filete"></span>
              <span class="entrada__titulo">${p.titulo}</span>
            </span>
          </span>
          <span class="entrada__dentado" aria-hidden="true"></span>
        </span>
        <span class="entrada__talon">
          <span class="entrada__talon-papel">
            <span class="entrada__talon-texto adv">Uri &amp; Guada</span>
            <span class="codigo-barras entrada__barras"></span>
          </span>
        </span>
      </button>
    </li>
  `;
}

export function montarCartelera(seccion, { alAbrir } = {}) {
  seccion.innerHTML = `
    <h2 class="cartelera__titulo adv">Cartelera</h2>
    <ul class="cartelera__grilla">${proyectos.map(entradaHTML).join('')}</ul>
  `;

  seccion.addEventListener('dragstart', (e) => e.preventDefault());

  const rotas = new Map();

  seccion.querySelectorAll('.entrada').forEach((entrada) => {
    entrada.addEventListener('click', () => {
      const slug = entrada.dataset.slug;
      if (rotas.has(slug)) return;
      const volver = romper(entrada);
      rotas.set(slug, volver);
      if (alAbrir) {
        const r = entrada.getBoundingClientRect();
        const origen = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        // primero se ve cortarse la entrada; recién después entra el visor
        setTimeout(() => alAbrir(slug, origen), 260);
      }
    });
  });

  return {
    recomponer(slug) {
      const volver = rotas.get(slug);
      if (!volver) return;
      rotas.delete(slug);
      volver();
    },
  };
}

function romper(entrada) {
  const cuerpo = entrada.querySelector('.entrada__cuerpo');
  const talon = entrada.querySelector('.entrada__talon');
  const dentado = entrada.querySelector('.entrada__dentado');
  const enMobile = window.matchMedia('(max-width: 720px)').matches;
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sonarRotura();
  if (navigator.vibrate) navigator.vibrate(12);
  entrada.classList.add('entrada--rota');

  // A dónde sale el talón: al costado en desktop, para abajo en mobile.
  const vuela = enMobile
    ? { x: 18, y: 230, rotate: 7 }
    : { x: 140, y: 300, rotate: 34 };

  if (!reducido) {
    gsap
      .timeline({ defaults: { transformOrigin: '50% 50%' } })
      .set(dentado, { autoAlpha: 1 }, 0.08)
      .to(cuerpo, { ...(enMobile ? { y: -3, rotate: 0.4 } : { x: -4, rotate: 0.8 }), duration: 0.14, ease: 'power2.out' }, 0)
      .to(talon, { ...(enMobile ? { y: 5, rotate: -1.2 } : { x: 6, rotate: -2 }), duration: 0.14, ease: 'power2.out' }, 0)
      .to(talon, { ...vuela, duration: 0.5, ease: 'power2.in' }, 0.16)
      .to(cuerpo, { x: enMobile ? 0 : -6, y: -8, scale: 1.012, duration: 0.3, ease: 'power2.out' }, 0.16);
  } else {
    gsap.set(talon, vuela);
  }

  // Se recompone de una, mientras el visor todavía tapa todo: la entrada rota no se ve nunca.
  return function recomponer() {
    gsap.set([cuerpo, talon], { x: 0, y: 0, rotate: 0, scale: 1 });
    gsap.set(dentado, { autoAlpha: 0 });
    entrada.classList.remove('entrada--rota');
  };
}
