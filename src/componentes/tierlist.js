// Tierlist: se arrastran las mini-entradas a las filas. Se guarda en localStorage.
import gsap from 'gsap';
import { proyectos, tiers } from '../data/proyectos.js';
import { descargarTierlist } from '../lib/tierlist-png.js';

const CLAVE = 'uyg:tierlist';

function leerEstado() {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    const limpio = {};
    for (const p of proyectos) {
      const v = crudo[p.slug];
      if (Number.isInteger(v) && v >= 0 && v < tiers.length) limpio[p.slug] = v;
    }
    return limpio;
  } catch (e) {
    return {};
  }
}

function guardarEstado(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) {
    /* modo privado: se pierde al cerrar */
  }
}

function miniHTML(p) {
  return `
    <button class="mini no-arrastre" type="button" data-slug="${p.slug}" aria-label="${p.titulo}" aria-pressed="false"
            style="--color:${p.color};--tinta-mini:${p.tinta}">
      <span class="mini__foto duo" style="background:${p.color}">
        <img src="${p.ticket.img}" alt="" loading="lazy" draggable="false" style="object-position:${p.ticket.pos}">
      </span>
      <span class="mini__titulo">${p.titulo}</span>
    </button>
  `;
}

export function montarTierlist(seccion) {
  const estado = leerEstado();
  let elegida = null;

  seccion.innerHTML = `
    <div class="tierlist__cabeza">
      <h2 class="tierlist__titulo">TIERLIST</h2>
      <div class="tierlist__botones">
        <button class="boton-linea" type="button" data-accion="reiniciar">REINICIAR</button>
        <button class="boton-negro muesca" type="button" data-accion="descargar">DESCARGAR MI TIERLIST ↓</button>
      </div>
    </div>

    <div class="tierlist__tabla">
      ${tiers
        .map(
          (t, i) => `
        <div class="fila" data-tier="${i}">
          <button class="fila__rotulo" type="button" style="background:${t.color}" aria-label="Poner la idea elegida en ${t.label}">${t.label}</button>
          <div class="fila__zona" data-zona="${i}"></div>
        </div>`
        )
        .join('')}
    </div>

    <p class="tierlist__rotulo mono">EN CARTEL</p>
    <div class="pozo" data-zona="pozo"></div>
  `;

  // El arrastre es nuestro: el del navegador (la imagen fantasma) se corta acá.
  seccion.addEventListener('dragstart', (e) => e.preventDefault());

  const zonas = new Map();
  seccion.querySelectorAll('[data-zona]').forEach((z) => zonas.set(z.dataset.zona, z));

  function pintar() {
    for (const z of zonas.values()) z.innerHTML = '';
    for (const p of proyectos) {
      const tier = estado[p.slug];
      const zona = tier === undefined ? zonas.get('pozo') : zonas.get(String(tier));
      zona.insertAdjacentHTML('beforeend', miniHTML(p));
    }
    for (const [clave, z] of zonas) {
      if (clave === 'pozo') continue;
      z.insertAdjacentHTML(
        'beforeend',
        `<button class="hueco" type="button" data-tier="${clave}" aria-label="Soltar acá">+</button>`
      );
    }
    marcarElegida();
  }

  function marcarElegida() {
    seccion.querySelectorAll('.mini').forEach((m) => {
      const activa = m.dataset.slug === elegida;
      m.classList.toggle('mini--elegida', activa);
      m.setAttribute('aria-pressed', String(activa));
    });
    seccion.querySelectorAll('.hueco').forEach((h) => h.classList.toggle('hueco--listo', !!elegida));
  }

  function colocar(slug, tier, { animar = true } = {}) {
    const antes = seccion.querySelector(`.mini[data-slug="${slug}"]`);
    const rectoAntes = antes ? antes.getBoundingClientRect() : null;
    if (tier === null) delete estado[slug];
    else estado[slug] = tier;
    guardarEstado(estado);
    elegida = null;
    pintar();
    const ahora = seccion.querySelector(`.mini[data-slug="${slug}"]`);
    if (animar && ahora && rectoAntes) {
      const rectoAhora = ahora.getBoundingClientRect();
      gsap.from(ahora, {
        x: rectoAntes.left - rectoAhora.left,
        y: rectoAntes.top - rectoAhora.top,
        duration: 0.45,
        ease: 'back.out(1.7)',
      });
      rebotar(ahora, tier);
    }
  }

  function rebotar(mini, tier) {
    gsap
      .timeline()
      .fromTo(mini, { scaleY: 0.92, scaleX: 1.04 }, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' }, 0.3);
    if (tier === null) return;
    const rotulo = seccion.querySelector(`.fila[data-tier="${tier}"] .fila__rotulo`);
    if (rotulo) {
      gsap.fromTo(rotulo, { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
  }

  // ---- toque y teclado: elegir y colocar ----
  seccion.addEventListener('click', (e) => {
    const mini = e.target.closest('.mini');
    if (mini && !mini.dataset.arrastrada) {
      elegida = elegida === mini.dataset.slug ? null : mini.dataset.slug;
      marcarElegida();
      return;
    }
    const destino = e.target.closest('.fila__rotulo, .hueco');
    if (destino && elegida) {
      const fila = destino.closest('.fila');
      colocar(elegida, Number(fila.dataset.tier));
      return;
    }
    const accion = e.target.closest('[data-accion]');
    if (!accion) return;
    if (accion.dataset.accion === 'reiniciar') reiniciar();
    if (accion.dataset.accion === 'descargar') descargarTierlist(estado);
  });

  function reiniciar() {
    const minis = [...seccion.querySelectorAll('.mini')];
    const rectos = minis.map((m) => [m.dataset.slug, m.getBoundingClientRect()]);
    for (const p of proyectos) delete estado[p.slug];
    guardarEstado(estado);
    elegida = null;
    pintar();
    rectos.forEach(([slug, antes], i) => {
      const ahora = seccion.querySelector(`.mini[data-slug="${slug}"]`);
      if (!ahora) return;
      const r = ahora.getBoundingClientRect();
      gsap.from(ahora, {
        x: antes.left - r.left,
        y: antes.top - r.top,
        duration: 0.5,
        delay: i * 0.04,
        ease: 'back.out(1.6)',
      });
    });
  }

  // ---- arrastre ----
  let arrastre = null;

  seccion.addEventListener('pointerdown', (e) => {
    const mini = e.target.closest('.mini');
    if (!mini || e.button !== 0) return;
    const toque = e.pointerType !== 'mouse';
    const rect = mini.getBoundingClientRect();
    arrastre = {
      mini,
      slug: mini.dataset.slug,
      rect,
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
      x: rect.left,
      y: rect.top,
      destinoX: rect.left,
      destinoY: rect.top,
      vx: 0,
      activo: false,
      inicio: { x: e.clientX, y: e.clientY },
      temporizador: toque ? setTimeout(() => iniciar(), 120) : null,
      pointerId: e.pointerId,
    };
    mini.setPointerCapture(e.pointerId);
    if (!toque) {
      // en mouse se arranca al mover 5 px
      arrastre.umbral = true;
    }
  });

  function iniciar() {
    if (!arrastre || arrastre.activo) return;
    arrastre.activo = true;
    const { mini, rect } = arrastre;
    const hueco = document.createElement('span');
    hueco.className = 'mini-hueco';
    mini.after(hueco);
    arrastre.hueco = hueco;
    Object.assign(mini.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      zIndex: '90',
    });
    mini.classList.add('mini--arrastrando');
    mini.dataset.arrastrada = '1';
    gsap.to(mini, { scale: 1.08, duration: 0.3, ease: 'back.out(2)' });
    bucle();
  }

  function bucle() {
    if (!arrastre || !arrastre.activo) return;
    const a = arrastre;
    const antes = a.x;
    a.x += (a.destinoX - a.x) * 0.25;
    a.y += (a.destinoY - a.y) * 0.25;
    a.vx = a.x - antes;
    const giro = Math.max(-10, Math.min(10, a.vx * 0.7));
    gsap.set(a.mini, { x: a.x - a.rect.left, y: a.y - a.rect.top, rotation: giro, scale: 1.08 });
    requestAnimationFrame(bucle);
  }

  seccion.addEventListener('pointermove', (e) => {
    if (!arrastre || arrastre.pointerId !== e.pointerId) return;
    if (!arrastre.activo) {
      const d = Math.hypot(e.clientX - arrastre.inicio.x, e.clientY - arrastre.inicio.y);
      if (arrastre.umbral && d > 5) iniciar();
      else if (d > 10 && arrastre.temporizador) {
        clearTimeout(arrastre.temporizador);
        arrastre.temporizador = null;
        arrastre = null;
      }
      if (!arrastre || !arrastre.activo) return;
    }
    e.preventDefault();
    arrastre.destinoX = e.clientX - arrastre.dx;
    arrastre.destinoY = e.clientY - arrastre.dy;
    resaltar(e.clientX, e.clientY);
  });

  function zonaEn(x, y) {
    for (const [clave, z] of zonas) {
      const r = z.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return clave;
    }
    const filaRotulo = document.elementFromPoint(x, y)?.closest?.('.fila__rotulo');
    if (filaRotulo) return filaRotulo.closest('.fila').dataset.tier;
    return null;
  }

  function resaltar(x, y) {
    const clave = zonaEn(x, y);
    seccion.querySelectorAll('.fila').forEach((f) => {
      const activa = f.dataset.tier === clave;
      f.classList.toggle('fila--activa', activa);
    });
    seccion.querySelector('.pozo').classList.toggle('pozo--activo', clave === 'pozo');
  }

  function soltar(e) {
    if (!arrastre || arrastre.pointerId !== e.pointerId) return;
    const a = arrastre;
    if (a.temporizador) clearTimeout(a.temporizador);
    if (!a.activo) {
      arrastre = null;
      return;
    }
    const clave = zonaEn(e.clientX, e.clientY);
    const { mini, hueco } = a;
    arrastre = null;

    seccion.querySelectorAll('.fila').forEach((f) => f.classList.remove('fila--activa'));
    seccion.querySelector('.pozo').classList.remove('pozo--activo');

    const limpiar = () => {
      mini.removeAttribute('style');
      mini.classList.remove('mini--arrastrando');
      hueco.remove();
      setTimeout(() => delete mini.dataset.arrastrada, 0);
    };

    if (clave === null) {
      // afuera: vuelve a su lugar
      gsap.to(mini, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.45,
        ease: 'back.out(1.7)',
        onComplete: limpiar,
      });
      return;
    }

    const tier = clave === 'pozo' ? null : Number(clave);
    // la mini que se arrastra sale del flujo para que el repintado no la borre
    document.body.append(mini);
    if (tier === null) delete estado[a.slug];
    else estado[a.slug] = tier;
    guardarEstado(estado);
    elegida = null;
    pintar();

    const destino = seccion.querySelector(`.mini[data-slug="${a.slug}"]`);
    if (!destino) {
      mini.remove();
      return;
    }
    const rDestino = destino.getBoundingClientRect();
    destino.style.visibility = 'hidden';
    gsap.to(mini, {
      x: rDestino.left - a.rect.left,
      y: rDestino.top - a.rect.top,
      rotation: 0,
      scale: 1,
      duration: 0.45,
      ease: 'back.out(1.7)',
      onComplete: () => {
        mini.remove();
        destino.style.visibility = '';
        rebotar(destino, tier);
      },
    });
  }

  seccion.addEventListener('pointerup', soltar);
  seccion.addEventListener('pointercancel', soltar);

  pintar();
}
