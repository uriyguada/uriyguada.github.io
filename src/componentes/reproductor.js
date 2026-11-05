// Reproductor A (línea): el video, el círculo de play y una línea de tiempo cómoda de agarrar.
const GRANDE = `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 7V2h5M13 2h5v5M18 13v5h-5M7 18H2v-5"/></svg>`;
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
          <span class="repro__fin">
            <span class="repro__tiempo">00:00 / ${dur}</span>
            <button type="button" class="repro__grande" aria-label="Pantalla completa">${GRANDE}</button>
          </span>
        </div>
        <div class="repro__linea" role="slider" tabindex="0" aria-label="Avance del video"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="repro__riel"><span class="repro__avance"></span></span><span class="repro__perilla"></span></div>
      </div>
    </div>`;

  const repro = caja.querySelector('.repro');
  const video = caja.querySelector('.repro__video');
  const play = caja.querySelector('.repro__play');
  const linea = caja.querySelector('.repro__linea');
  const tiempo = caja.querySelector('.repro__tiempo');

  let cargado = false;
  let arrastrando = false;
  function cargar() {
    if (cargado) return;
    cargado = true;
    video.preload = 'metadata';
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
  // En el celular, si la barra está escondida, el primer toque solo la muestra.
  let puntero = 'mouse';
  repro.addEventListener('pointerdown', (e) => (puntero = e.pointerType), true);
  video.addEventListener('click', () => {
    if (puntero !== 'mouse' && repro.classList.contains('repro--quieta')) despertar();
    else alternar();
  });
  function pantallaCompleta() {
    if (document.fullscreenElement) return document.exitFullscreen();
    if (repro.requestFullscreen) return repro.requestFullscreen();
    // iPhone: solo el video puede ir a pantalla completa
    if (video.webkitEnterFullscreen) {
      cargar();
      video.webkitEnterFullscreen();
    }
  }
  video.addEventListener('dblclick', pantallaCompleta);
  caja.querySelector('.repro__grande').addEventListener('click', pantallaCompleta);

  video.addEventListener('play', () => {
    repro.classList.add('repro--andando');
    despertar();
  });
  video.addEventListener('pause', () => {
    repro.classList.remove('repro--andando');
    repro.classList.remove('repro--quieta');
  });

  function pintar(fraccion) {
    const p = fraccion * 100;
    linea.style.setProperty('--avance', `${p}%`);
    linea.setAttribute('aria-valuenow', Math.round(p));
    if (video.duration) tiempo.textContent = `${reloj(fraccion * video.duration)} / ${reloj(Math.round(video.duration))}`;
  }

  video.addEventListener('timeupdate', () => {
    if (!arrastrando && video.duration) pintar(video.currentTime / video.duration);
  });

  // la barra se esconde sola a los 2 s sin mover el mouse
  let quieto = null;
  function despertar() {
    repro.classList.remove('repro--quieta');
    clearTimeout(quieto);
    if (video.paused) return;
    quieto = setTimeout(() => {
      if (!arrastrando) repro.classList.add('repro--quieta');
    }, 2000);
  }
  repro.addEventListener('pointermove', despertar);
  repro.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !arrastrando && !video.paused) repro.classList.add('repro--quieta');
  });

  // Al arrastrar, la línea sigue al dedo al instante y el video salta al último punto
  // cuando termina el salto anterior: así no se traba pidiéndole un salto por movimiento.
  let destino = null;
  function saltar() {
    if (destino === null || !video.duration || video.seeking) return;
    video.currentTime = destino * video.duration;
    destino = null;
  }
  video.addEventListener('seeked', saltar);
  video.addEventListener('loadedmetadata', saltar);

  function buscarEn(clientX) {
    const r = linea.getBoundingClientRect();
    const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    pintar(p);
    destino = p;
    saltar();
  }

  linea.addEventListener('pointerdown', (e) => {
    cargar();
    linea.setPointerCapture(e.pointerId);
    arrastrando = true;
    repro.classList.add('repro--arrastrando');
    buscarEn(e.clientX);
    const mover = (ev) => buscarEn(ev.clientX);
    const soltar = () => {
      arrastrando = false;
      repro.classList.remove('repro--arrastrando');
      linea.removeEventListener('pointermove', mover);
      linea.removeEventListener('lostpointercapture', soltar);
      despertar();
    };
    linea.addEventListener('pointermove', mover);
    linea.addEventListener('lostpointercapture', soltar);
  });

  linea.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    // las flechas mueven el video, no pasan de proyecto
    e.stopPropagation();
    cargar();
    video.currentTime = Math.max(0, video.currentTime + (e.key === 'ArrowRight' ? 5 : -5));
  });
}
