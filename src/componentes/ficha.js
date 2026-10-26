// Ficha de un proyecto: es el panel que vive adentro del visor.
import { dupla, proyectos } from '../data/proyectos.js';
import { montarReproductor } from './reproductor.js';
import { abrirLupa } from './lupa.js';

const CLAVE_ESTRELLAS = 'uyg:estrellas';

function leerEstrellas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ESTRELLAS) || '{}');
  } catch (e) {
    return {};
  }
}

function guardarEstrellas(datos) {
  try {
    localStorage.setItem(CLAVE_ESTRELLAS, JSON.stringify(datos));
  } catch (e) {
    /* sin localStorage no se guarda */
  }
}

function pegatinasHTML(p) {
  const g = p.pegatinas || {};
  const partes = [];
  if (g.s1) {
    partes.push(`<span class="pegatina s1" style="background:${g.s1.bg}">${g.s1.texto}</span>`);
  }
  if (g.s2) {
    const id = `anillo-${p.slug}`;
    partes.push(`
      <svg class="pegatina s2" viewBox="0 0 180 180" aria-hidden="true">
        <defs><path id="${id}" d="M90,90 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0"></path></defs>
        <circle cx="90" cy="90" r="87" fill="${g.s2.bg}" stroke="#1B1916" stroke-width="3"></circle>
        <circle cx="90" cy="90" r="46" fill="none" stroke="#1B1916" stroke-width="2"></circle>
        <text font-family="Courier Prime, monospace" font-size="14" font-weight="700" fill="#1B1916" letter-spacing="3"><textPath href="#${id}">${g.s2.anillo}</textPath></text>
        <text x="90" y="99" text-anchor="middle" font-family="Archivo Narrow, sans-serif" font-weight="700" font-size="30" fill="#1B1916">${g.s2.centro}</text>
      </svg>`);
  }
  if (g.s3) {
    partes.push(`<span class="pegatina s3" style="background:${g.s3.bg}">${g.s3.texto.join('<br>')}</span>`);
  }
  if (g.s4) {
    partes.push(`<span class="pegatina s4 mono" style="background:${g.s4.bg}">${g.s4.texto}</span>`);
  }
  return partes.join('');
}

function pestanasHTML(p) {
  const tabs = [];
  if (p.video) tabs.push({ id: 'video', texto: p.video.pestaña || 'VIDEOCASO' });
  if (p.board) tabs.push({ id: 'board', texto: 'BOARD' });
  if (p.piezas) tabs.push({ id: 'piezas', texto: p.piezas.pestaña });
  tabs.push({ id: 'estrellas', texto: 'ESTRELLAS' });
  return `<nav class="ficha__pestanas" aria-label="Secciones de la ficha">${tabs
    .map((t, i) => `<button type="button" class="ficha__pestana${i === 0 ? ' ficha__pestana--activa' : ''}" data-ir="${t.id}">${t.texto}</button>`)
    .join('')}</nav>`;
}

function videoHTML(p) {
  if (!p.video) return '';
  const tira = p.tira
    ? `<div class="tira">
         <span class="tira__perforado"></span>
         <div class="tira__fotos">${p.tira
           .map((t) => `<img src="${t.img}" alt="${t.alt}" loading="lazy" draggable="false">`)
           .join('')}</div>
         <span class="tira__perforado"></span>
       </div>`
    : '';
  return `
    <section class="ficha__seccion ficha__video" id="video-${p.slug}">
      <h3 class="ficha__rotulo adv">${p.video.rotulo || 'Videocaso'}</h3>
      <div class="reproductor" data-video="${p.video.archivo}" data-poster="${p.video.poster}"
           data-alt="${p.video.alt}" data-dur="${p.video.dur}" data-n="${p.n}" data-titulo="${p.titulo}"
           style="--color:${p.color}"></div>
      ${tira}
    </section>`;
}

function boardHTML(p) {
  if (!p.board) return '';
  return `
    <section class="ficha__seccion ficha__board" id="board-${p.slug}">
      <h3 class="ficha__rotulo adv">Board</h3>
      <div class="board__marco"><button type="button" class="pieza" aria-label="Ver ${p.board.alt}"><img src="${p.board.img}" alt="${p.board.alt}" loading="lazy" draggable="false"></button></div>
    </section>`;
}

function piezasHTML(p) {
  if (!p.piezas) return '';
  const z = p.piezas;
  const img = (it) =>
    `<button type="button" class="pieza" aria-label="Ver ${it.alt}"><img src="${it.img}" alt="${it.alt}" loading="lazy" draggable="false"></button>`;
  let cuerpo = '';
  if (z.layout === 'una-grande-dos-chicas') {
    cuerpo = `
      <div class="piezas__grande">${img(z.items[0])}</div>
      <div class="piezas__par">
        <div class="piezas__caja">${img(z.items[1])}</div>
        <div class="piezas__caja">${img(z.items[2])}</div>
      </div>`;
  } else if (z.layout === 'tres-columnas-contain') {
    cuerpo = `<div class="piezas__tres">${z.items.map((it) => `<div class="piezas__caja piezas__caja--contain">${img(it)}</div>`).join('')}</div>`;
  } else {
    cuerpo = `<div class="piezas__grilla">${z.items.map((it) => `<div class="piezas__caja">${img(it)}</div>`).join('')}</div>`;
  }
  return `
    <section class="ficha__seccion ficha__piezas" id="piezas-${p.slug}" style="background:${z.fondo}">
      <h3 class="ficha__rotulo adv" style="color:${z.tituloColor}">${z.titulo}</h3>
      ${cuerpo}
    </section>`;
}

function estrellasHTML(p) {
  const mias = leerEstrellas()[p.slug] || 0;
  const picker = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" role="radio" aria-checked="${n === mias}" aria-label="${n} ${n === 1 ? 'estrella' : 'estrellas'}" data-estrella="${n}" class="estrella${n <= mias ? ' estrella--puesta' : ''}">★</button>`
    )
    .join('');
  return `
    <section class="ficha__seccion ficha__estrellas" id="estrellas-${p.slug}">
      <div class="estrellas__tuyas">
        <span class="mono estrellas__rotulo">TU CALIFICACIÓN</span>
        <div class="estrellas__picker" role="radiogroup" aria-label="Tu calificación">${picker}</div>
      </div>
    </section>`;
}

function proximaHTML(p) {
  const i = proyectos.findIndex((x) => x.slug === p.slug);
  const q = proyectos[(i + 1) % proyectos.length];
  return `
    <section class="ficha__seccion ficha__proxima">
      <p class="mono ficha__proxima-rotulo">PRÓXIMA FUNCIÓN ———</p>
      <button type="button" class="proxima no-arrastre" data-ir-ficha="${q.slug}"
              style="--color:${q.color};--tinta-entrada:${q.tinta};--fs-proxima:${q.titulo.length > 14 ? 62 : 96}px" aria-label="Ir a ${q.titulo}">
        <span class="proxima__foto duo" style="background:${q.color}">
          <img src="${q.proximaImg || q.ticket.img}" alt="" loading="lazy" draggable="false" style="object-position:${q.ticket.pos}">
        </span>
        <span class="proxima__datos">
          <span class="mono proxima__meta">FUNCIÓN ${q.n} · ${q.marca}</span>
          <span class="proxima__titulo">${q.titulo}</span>
        </span>
        <span class="proxima__talon">VER →</span>
      </button>
    </section>`;
}

export function fichaHTML(p) {
  return `
    <article class="panel" data-slug="${p.slug}" style="--heroBg:${p.heroBg};--color:${p.color};--tinta-p:${p.tinta};--fs-titulo:${p.titulo.length > 14 ? 130 : 170}px"
             aria-label="Función ${p.n}: ${p.titulo}">
      <div class="panel__scroll">
        <header class="ficha__hero">
          <div class="mono ficha__meta"><span>FUNCIÓN ${p.n}</span><i></i><span>${p.marca}</span></div>
          <div class="mono ficha__creditos">${dupla.creditos.map((c) => `<span>${c}</span>`).join('')}</div>
          <h2 class="ficha__titulo">${p.tituloLineas.join('<br>')}</h2>
          <p class="mono ficha__para">una idea para ${p.para}</p>
          <div class="ficha__marco">
            <span class="duo ficha__foto"><img src="${p.hero.img}" alt="${p.hero.alt}" loading="lazy" draggable="false" style="object-position:${p.hero.pos}"></span>
            ${pegatinasHTML(p)}
          </div>
          <p class="mono ficha__logline">${p.logline}</p>
        </header>
        ${pestanasHTML(p)}
        ${videoHTML(p)}
        ${boardHTML(p)}
        ${piezasHTML(p)}
        ${estrellasHTML(p)}
        ${proximaHTML(p)}
      </div>
    </article>`;
}

export function montarFicha(panel, p, { irA } = {}) {
  const scroll = panel.querySelector('.panel__scroll');

  // tocar la parte de arriba lleva a la primera sección: en casi todas, el videocaso
  const hero = panel.querySelector('.ficha__hero');
  const primera = panel.querySelector('.ficha__seccion[id]');
  if (hero && primera) {
    hero.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) return;
      scroll.scrollTo({ top: primera.offsetTop - 4, behavior: 'smooth' });
    });
  }

  panel.addEventListener('click', (e) => {
    const b = e.target.closest('.pieza');
    if (!b) return;
    const im = b.querySelector('img');
    abrirLupa(im.currentSrc || im.src, im.alt);
  });

  panel.querySelectorAll('[data-ir]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const destino = panel.querySelector(`#${boton.dataset.ir}-${p.slug}`);
      if (!destino) return;
      scroll.scrollTo({ top: destino.offsetTop - 4, behavior: 'smooth' });
    });
  });

  // la pestaña activa sigue a la sección que se está mirando
  const secciones = [...panel.querySelectorAll('.ficha__seccion[id]')];
  const pestanas = [...panel.querySelectorAll('[data-ir]')];
  if (secciones.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const id = e.target.id.replace(`-${p.slug}`, '');
          pestanas.forEach((t) => t.classList.toggle('ficha__pestana--activa', t.dataset.ir === id));
        }
      },
      { root: scroll, rootMargin: '-45% 0px -50% 0px' }
    );
    secciones.forEach((s) => obs.observe(s));
  }

  const picker = panel.querySelector('.estrellas__picker');
  if (picker) {
    picker.addEventListener('click', (e) => {
      const b = e.target.closest('[data-estrella]');
      if (!b) return;
      const n = Number(b.dataset.estrella);
      const datos = leerEstrellas();
      datos[p.slug] = n;
      guardarEstrellas(datos);
      [...picker.children].forEach((hijo, k) => {
        hijo.classList.toggle('estrella--puesta', k < n);
        hijo.setAttribute('aria-checked', String(k + 1 === n));
        if (k < n) {
          hijo.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
            { duration: 320, delay: k * 45, easing: 'cubic-bezier(.2,.8,.2,1)' }
          );
        }
      });
    });
  }

  const proxima = panel.querySelector('[data-ir-ficha]');
  if (proxima && irA) {
    proxima.addEventListener('click', () => irA(proxima.dataset.irFicha));
  }

  const caja = panel.querySelector('.reproductor');
  if (caja) montarReproductor(caja);

  return { scroll };
}
