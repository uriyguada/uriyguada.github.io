// Sacá tu entrada: el contacto de cada uno, dentro de una entrada grande.
import gsap from 'gsap';
import { dupla } from '../data/proyectos.js';

function filas(p) {
  return `
    <a class="contacto__fila mono" href="mailto:${p.mail}" data-copiar="${p.mail}">
      <span class="contacto__rotulo">MAIL</span><span class="contacto__dato">${p.mail}</span>
    </a>
    <a class="contacto__fila mono" href="${p.whatsapp}" target="_blank" rel="noopener">
      <span class="contacto__rotulo">WHATSAPP</span><span class="contacto__dato">${p.telefono}</span>
    </a>
    <a class="contacto__fila mono" href="${p.linkedin}" target="_blank" rel="noopener">
      <span class="contacto__rotulo">LINKEDIN</span><span class="contacto__dato">${p.linkedinTexto} ↗</span>
    </a>
  `;
}

export function montarContacto(seccion) {
  seccion.innerHTML = `
    <div class="contacto__entrada">
      <div class="contacto__cuerpo">
        <h2 class="contacto__titulo">SACÁ TU ENTRADA</h2>
        <div class="contacto__grilla">
          ${dupla.personas
            .map(
              (p) => `
            <div class="contacto__persona">
              <span class="contacto__nombre roy" style="color:${p.tinta}">${p.nombre}</span>
              <div class="contacto__filas">${filas(p)}</div>
            </div>`
            )
            .join('')}
        </div>
      </div>
      <div class="contacto__talon">
        <span class="contacto__talon-firma roy">Uri &amp; Guada</span>
        <span class="codigo-barras contacto__barras"></span>
      </div>
    </div>
  `;

  const talon = seccion.querySelector('.contacto__talon');
  seccion.querySelectorAll('[data-copiar]').forEach((a) => {
    a.addEventListener('click', () => {
      const texto = a.dataset.copiar;
      if (navigator.clipboard) navigator.clipboard.writeText(texto).catch(() => {});
      gsap
        .timeline()
        .to(talon, { rotate: -1.4, scale: 1.02, duration: 0.12, ease: 'power2.out' })
        .to(talon, { rotate: 0, scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.45)' });
    });
  });
}
