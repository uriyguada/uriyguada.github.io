// Reproductor A (línea): el video, el círculo de play y una barra fina abajo.
const PLAY = `<svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true"><path d="M14 9.5 31 20 14 30.5z" fill="currentColor"/></svg>`;

function reloj(seg) {
  if (!isFinite(seg)) return '00:00';
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function montarReproductor(caja) {
  const { video: archivo, poster, alt, dur, n, titulo } = caja.dataset;

  caja.innerHTML = `
    <div class="repro">
      <video class="repro__video" preload="none" playsinline poster="${poster}" aria-label="${alt}"></video>
      <button type="button" class="repro__play" aria-label="Reproducir">${PLAY}</button>
      <div class="repro__barra">
        <div class="mono repro__fila">
          <span>FUNCIÓN ${n} · ${titulo}</span>
          <span class="repro__tiempo">00:00 / ${dur}</span>
        </div>
        <div class="repro__linea" role="slider" tabindex="0" aria-label="Avance del video"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="repro__avance"></span></div>
      </div>
    </div>`;

  const repro = caja.querySelector('.repro');
  const video = caja.querySelector('.repro__video');
  const play = caja.querySelector('.repro__play');
  const linea = caja.querySelector('.repro__linea');
  const avance = caja.querySelector('.repro__avance');
  const tiempo = caja.querySelector('.repro__tiempo');

  let cargado = false;
  function cargar() {
    if (cargado) return;
    cargado = true;
    const fuente = document.createElement('source');
    fuente.src = archivo;
    fuente.type = 'video/mp4';
    video.append(fuente);
    video.load();
  }

  video.addEventListener('error', () => repro.classList.add('repro--sin-archivo'), true);

  function alternar() {
    cargar();
    if (video.paused) {
      video.play().catch(() => repro.classList.add('repro--sin-archivo'));
    } else {
      video.pause();
    }
  }

  play.addEventListener('click', alternar);
  video.addEventListener('click', alternar);
  video.addEventListener('dblclick', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else repro.requestFullscreen?.();
  });

  video.addEventListener('play', () => repro.classList.add('repro--andando'));
  video.addEventListener('pause', () => {
    repro.classList.remove('repro--andando');
    repro.classList.remove('repro--quieta');
  });

  video.addEventListener('timeupdate', () => {
    const p = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    avance.style.width = `${p}%`;
    linea.setAttribute('aria-valuenow', Math.round(p));
    tiempo.textContent = `${reloj(video.currentTime)} / ${video.duration ? reloj(video.duration) : dur}`;
  });

  // la barra se esconde sola a los 2 s sin mover el mouse
  let quieto = null;
  function despertar() {
    repro.classList.remove('repro--quieta');
    clearTimeout(quieto);
    if (video.paused) return;
    quieto = setTimeout(() => repro.classList.add('repro--quieta'), 2000);
  }
  repro.addEventListener('pointermove', despertar);
  repro.addEventListener('pointerleave', () => {
    if (!video.paused) repro.classList.add('repro--quieta');
  });

  function buscarEn(clientX) {
    const r = linea.getBoundingClientRect();
    const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    if (video.duration) video.currentTime = p * video.duration;
    else avance.style.width = `${p * 100}%`;
  }

  linea.addEventListener('pointerdown', (e) => {
    cargar();
    linea.setPointerCapture(e.pointerId);
    buscarEn(e.clientX);
    const mover = (ev) => buscarEn(ev.clientX);
    const soltar = () => {
      linea.removeEventListener('pointermove', mover);
      linea.removeEventListener('pointerup', soltar);
    };
    linea.addEventListener('pointermove', mover);
    linea.addEventListener('pointerup', soltar);
  });

  linea.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    cargar();
    video.currentTime = Math.max(0, video.currentTime + (e.key === 'ArrowRight' ? 5 : -5));
  });
}
