// Sonido de papel de la rotura. Se decodifica una sola vez con Web Audio
// para que no haya latencia al tocar una entrada.
const CLAVE = 'uyg:sonido';
const ARCHIVOS = ['/sound/ticket-rotura.webm', '/sound/ticket-rotura-2.webm', '/sound/ticket-rotura-3.webm'];
const RESPALDO = ['/sound/ticket-rotura.mp3', '/sound/ticket-rotura-2.mp3', '/sound/ticket-rotura-3.mp3'];

let contexto = null;
let buffers = null;
let cargando = null;

export function estaSilenciado() {
  try {
    return localStorage.getItem(CLAVE) === 'mudo';
  } catch (e) {
    return false;
  }
}

export function alternarSilencio() {
  const mudo = !estaSilenciado();
  try {
    localStorage.setItem(CLAVE, mudo ? 'mudo' : 'con');
  } catch (e) {
    /* sin localStorage se queda en la sesión */
  }
  return mudo;
}

function soportaWebm() {
  const a = document.createElement('audio');
  return a.canPlayType('audio/webm') !== '';
}

async function cargar() {
  if (buffers) return buffers;
  if (cargando) return cargando;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  contexto = contexto || new Ctx();
  const lista = soportaWebm() ? ARCHIVOS : RESPALDO;
  cargando = Promise.all(
    lista.map(async (url) => {
      const res = await fetch(url);
      const datos = await res.arrayBuffer();
      return contexto.decodeAudioData(datos);
    })
  )
    .then((bs) => {
      buffers = bs;
      return bs;
    })
    .catch(() => null);
  return cargando;
}

// Se llama en el primer gesto: deja el contexto listo y los sonidos decodificados.
export function prepararSonido() {
  const arranque = () => {
    cargar().then(() => {
      if (contexto && contexto.state === 'suspended') contexto.resume();
    });
  };
  window.addEventListener('pointerdown', arranque, { once: true });
  window.addEventListener('keydown', arranque, { once: true });
}

export async function sonarRotura() {
  if (estaSilenciado()) return;
  const bs = await cargar();
  if (!bs || !contexto) return;
  if (contexto.state === 'suspended') await contexto.resume();
  const fuente = contexto.createBufferSource();
  fuente.buffer = bs[Math.floor(Math.random() * bs.length)];
  fuente.playbackRate.value = 0.92 + Math.random() * 0.16;
  const ganancia = contexto.createGain();
  ganancia.gain.value = 0.8;
  fuente.connect(ganancia).connect(contexto.destination);
  fuente.start();
}
