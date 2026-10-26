// Lupa: abre una pieza a pantalla completa y deja agrandarla para verla de cerca.
let lupa = null;
let foto = null;

function crear() {
  if (lupa) return lupa;
  lupa = document.createElement('div');
  lupa.className = 'lupa';
  lupa.hidden = true;
  lupa.innerHTML = `
    <div class="lupa__caja"><img class="lupa__foto no-arrastre" alt="" draggable="false"></div>
    <button type="button" class="lupa__cerrar" aria-label="Cerrar">✕</button>`;
  document.body.append(lupa);
  foto = lupa.querySelector('.lupa__foto');

  lupa.querySelector('.lupa__cerrar').addEventListener('click', cerrarLupa);
  lupa.addEventListener('click', (e) => {
    if (e.target === lupa || e.target.closest('.lupa__caja') === e.target) cerrarLupa();
  });
  foto.addEventListener('click', (e) => {
    e.stopPropagation();
    agrandar(!foto.classList.contains('lupa__foto--grande'), e);
  });
  window.addEventListener('keydown', (e) => {
    if (!lupa.hidden && e.key === 'Escape') cerrarLupa();
  });
  return lupa;
}

function agrandar(si, e) {
  const caja = lupa.querySelector('.lupa__caja');
  foto.classList.toggle('lupa__foto--grande', si);
  if (!si) return;
  // al agrandar, se centra donde tocaste
  const r = foto.getBoundingClientRect();
  const px = e ? (e.clientX - r.left) / r.width : 0.5;
  const py = e ? (e.clientY - r.top) / r.height : 0.5;
  requestAnimationFrame(() => {
    caja.scrollLeft = px * caja.scrollWidth - caja.clientWidth / 2;
    caja.scrollTop = py * caja.scrollHeight - caja.clientHeight / 2;
  });
}

export function abrirLupa(src, alt) {
  crear();
  foto.src = src;
  foto.alt = alt || '';
  foto.classList.remove('lupa__foto--grande');
  lupa.hidden = false;
  document.body.classList.add('con-lupa');
  lupa.querySelector('.lupa__cerrar').focus({ preventScroll: true });
}

export function cerrarLupa() {
  if (!lupa || lupa.hidden) return;
  lupa.hidden = true;
  foto.removeAttribute('src');
  document.body.classList.remove('con-lupa');
}
