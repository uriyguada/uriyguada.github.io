// Sonidos de la web: abrir y cerrar un proyecto, pasar al siguiente y los clicks.
// Se decodifican una sola vez con Web Audio para que no haya latencia.
const ARCHIVOS = {
  abrir: ['/sound/abrir.mp3'],
  cerrar: ['/sound/cerrar.mp3'],
  pasar: ['/sound/pasar.mp3'],
  click: ['/sound/click-2.mp3', '/sound/click-3.mp3', '/sound/click-4.mp3'],
};

let contexto = null;
let buffers = null;
let cargando = null;

async function cargar() {
  if (buffers) return buffers;
  if (cargando) return cargando;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  contexto = contexto || new Ctx();
  cargando = (async () => {
    const res = {};
    for (const [nombre, urls] of Object.entries(ARCHIVOS)) {
      res[nombre] = await Promise.all(
        urls.map(async (url) => contexto.decodeAudioData(await (await fetch(url)).arrayBuffer()))
      );
    }
    buffers = res;
    return res;
  })().catch(() => null);
  return cargando;
}

// Los navegadores no dejan sonar nada antes del primer gesto: ahí se prepara todo.
export function prepararSonido() {
  const arranque = () => {
    cargar().then(() => {
      if (contexto && contexto.state === 'suspended') contexto.resume();
    });
  };
  window.addEventListener('pointerdown', arranque, { once: true });
  window.addEventListener('keydown', arranque, { once: true });
}

export async function sonar(nombre, { volumen = 0.8 } = {}) {
  const bs = await cargar();
  if (!bs || !contexto || !bs[nombre]) return;
  if (contexto.state === 'suspended') await contexto.resume();
  const lista = bs[nombre];
  const fuente = contexto.createBufferSource();
  fuente.buffer = lista[Math.floor(Math.random() * lista.length)];
  const ganancia = contexto.createGain();
  ganancia.gain.value = volumen;
  fuente.connect(ganancia).connect(contexto.destination);
  fuente.start();
}
