// Cartelera: las 8 entradas. Al tocar una se abre su ficha.
import { proyectos } from '../data/proyectos.js';

// Cada título se achica lo justo para entrar en su entrada (las palabras largas no se cortan).
function ajustarTitulos(seccion) {
  for (const e of seccion.querySelectorAll('.entrada')) {
    const t = e.querySelector('.entrada__titulo');
    e.style.setProperty('--escala-titulo', '1');
    const sobra = t.scrollWidth / t.clientWidth;
    if (sobra > 1) e.style.setProperty('--escala-titulo', ((1 / sobra) * 0.97).toFixed(3));
  }
}

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

  const ajustar = () => ajustarTitulos(seccion);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(ajustar);
  let espera = null;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(ajustar, 150);
  });

  seccion.querySelectorAll('.entrada').forEach((entrada) => {
    entrada.addEventListener('click', () => {
      if (alAbrir) alAbrir(entrada.dataset.slug);
    });
  });
}
