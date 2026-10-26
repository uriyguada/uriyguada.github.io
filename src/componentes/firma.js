// Firma "Uri & Guada" en Roycella, armada como un solo bloque:
// el & va montado sobre las dos palabras, que se le encastran encima.
// Se escribe con una animación de tinta (una máscara de trazos que avanza).
import gsap from 'gsap';

const NS = 'http://www.w3.org/2000/svg';
let contador = 0;

const MEDIDAS = {
  // cuánto se solapan las partes, medido en anchos del &
  horizontal: { nombre: 250, amp: 470, solapeIzq: 0.30, solapeDer: 0.34, ampDy: 56 },
  vertical: { nombre: 230, amp: 400, paso: 1.02, sangria: 0.22, ampDy: 0.42 },
};

function crear(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Trazo ondulado de izquierda a derecha: es el que "escribe" la palabra.
function trazoPalabra(x0, x1, yc, altura) {
  const ancho = x1 - x0;
  const onda = altura * 0.07;
  const p1 = x0 + ancho * 0.28;
  const p2 = x0 + ancho * 0.56;
  const p3 = x0 + ancho * 0.82;
  return `M ${x0} ${yc + onda} C ${p1} ${yc - onda * 1.6}, ${p2} ${yc + onda * 1.4}, ${p3} ${yc - onda * 0.8} S ${x1 - ancho * 0.08} ${yc + onda}, ${x1} ${yc}`;
}

// El & se dibuja de un gesto: arranca arriba a la derecha, baja hacia la izquierda y vuelve.
function trazoAmp(b) {
  const { x, y, width: w, height: h } = b;
  return `M ${x + w * 0.92} ${y + h * 0.10} C ${x + w * 0.35} ${y + h * 0.02}, ${x + w * 0.10} ${y + h * 0.42}, ${x + w * 0.46} ${y + h * 0.62} C ${x + w * 0.80} ${y + h * 0.80}, ${x + w * 0.18} ${y + h * 1.02}, ${x + w * 0.98} ${y + h * 0.94}`;
}

export function crearFirma(opciones = {}) {
  const {
    variante = 'horizontal',
    colorNombre = '#EEE6D3',
    colorAmp = '#BA0101',
    sombra = false,
  } = opciones;

  const m = MEDIDAS[variante];
  const id = `firma-${++contador}`;
  const svg = crear('svg', {
    class: `firma firma--${variante}${sombra ? ' firma--sombra' : ''}`,
    role: 'img',
    'aria-label': 'Uri & Guada',
    viewBox: '0 0 1000 400',
    preserveAspectRatio: 'xMidYMid meet',
  });

  const defs = crear('defs');
  const mascara = crear('mask', { id: `${id}-mask`, maskUnits: 'userSpaceOnUse' });
  defs.append(mascara);
  svg.append(defs);

  const grupo = crear('g', { class: 'firma__grupo' });
  svg.append(grupo);

  const partes = {
    uri: crear('text', { class: 'firma__nombre', 'font-size': m.nombre, fill: colorNombre }),
    amp: crear('text', { class: 'firma__amp', 'font-size': m.amp, fill: colorAmp }),
    guada: crear('text', { class: 'firma__nombre', 'font-size': m.nombre, fill: colorNombre }),
  };
  partes.uri.textContent = 'Uri';
  partes.amp.textContent = '&';
  partes.guada.textContent = 'Guada';

  // el & va primero para que los nombres se le monten encima
  grupo.append(partes.amp, partes.uri, partes.guada);

  const pluma = crear('circle', { class: 'firma__pluma', r: 0, fill: colorNombre, opacity: 0 });
  svg.append(pluma);

  let cajas = null;

  function maquetar() {
    for (const el of Object.values(partes)) el.removeAttribute('transform');
    const bUri = partes.uri.getBBox();
    const bAmp = partes.amp.getBBox();
    const bGua = partes.guada.getBBox();
    if (!bAmp.width) return null;

    const mover = (el, tx, ty) => el.setAttribute('transform', `translate(${tx} ${ty})`);
    let caja = {};

    if (variante === 'horizontal') {
      const uriTx = -bUri.x;
      const ampTx = bUri.width - m.solapeIzq * bAmp.width - bAmp.x;
      const ampTy = m.ampDy;
      const ampDer = ampTx + bAmp.x + bAmp.width;
      const guaTx = ampDer - m.solapeDer * bAmp.width - bGua.x;
      mover(partes.uri, uriTx, 0);
      mover(partes.amp, ampTx, ampTy);
      mover(partes.guada, guaTx, 0);
      caja = {
        uri: { x: 0, y: bUri.y, width: bUri.width, height: bUri.height },
        amp: { x: ampTx + bAmp.x, y: bAmp.y + ampTy, width: bAmp.width, height: bAmp.height },
        guada: { x: guaTx + bGua.x, y: bGua.y, width: bGua.width, height: bGua.height },
      };
    } else {
      const uriTx = -bUri.x;
      const guaTy = m.nombre * m.paso;
      const guaTx = -bGua.x + bUri.width * m.sangria;
      const anchoTotal = Math.max(bUri.width, guaTx + bGua.x + bGua.width);
      const ampTx = (anchoTotal - bAmp.width) / 2 - bAmp.x + bUri.width * 0.1;
      const ampTy = guaTy * m.ampDy + bAmp.height * 0.22;
      mover(partes.uri, uriTx, 0);
      mover(partes.amp, ampTx, ampTy);
      mover(partes.guada, guaTx, guaTy);
      caja = {
        uri: { x: 0, y: bUri.y, width: bUri.width, height: bUri.height },
        amp: { x: ampTx + bAmp.x, y: bAmp.y + ampTy, width: bAmp.width, height: bAmp.height },
        guada: { x: guaTx + bGua.x, y: bGua.y + guaTy, width: bGua.width, height: bGua.height },
      };
    }

    const todas = Object.values(caja);
    const x0 = Math.min(...todas.map((b) => b.x));
    const y0 = Math.min(...todas.map((b) => b.y));
    const x1 = Math.max(...todas.map((b) => b.x + b.width));
    const y1 = Math.max(...todas.map((b) => b.y + b.height));
    const aire = m.nombre * 0.12;
    const vista = `${x0 - aire} ${y0 - aire} ${x1 - x0 + aire * 2} ${y1 - y0 + aire * 2}`;
    if (cajas && vista === svg.getAttribute('viewBox')) return cajas;
    svg.setAttribute('viewBox', vista);
    cajas = caja;
    // Si la fuente cambió las medidas en medio de la escritura, se muestra entera.
    if (grupo.getAttribute('mask')) {
      grupo.removeAttribute('mask');
      gsap.set(grupo, { opacity: 1 });
    }
    return caja;
  }

  function prepararTrazos() {
    mascara.textContent = '';
    const trazos = [];
    const defTrazos = [
      { clave: 'uri', ancho: 1.34 },
      { clave: 'amp', ancho: 0.5, esAmp: true },
      { clave: 'guada', ancho: 1.34 },
    ];
    for (const d of defTrazos) {
      const b = cajas[d.clave];
      const grosor = (d.esAmp ? b.width : b.height) * d.ancho;
      const aire = grosor * 0.12;
      const dAttr = d.esAmp
        ? trazoAmp(b)
        : trazoPalabra(b.x - aire, b.x + b.width + aire, b.y + b.height / 2, b.height);
      const path = crear('path', {
        d: dAttr,
        fill: 'none',
        stroke: '#fff',
        'stroke-width': grosor,
        'stroke-linecap': d.esAmp ? 'round' : 'butt',
        'stroke-linejoin': 'round',
      });
      mascara.append(path);
      const largo = path.getTotalLength();
      path.style.strokeDasharray = largo;
      path.style.strokeDashoffset = largo;
      trazos.push({ path, largo });
    }
    grupo.setAttribute('mask', `url(#${id}-mask)`);
    return trazos;
  }

  function escribir({ retraso = 0 } = {}) {
    if (!cajas) return gsap.timeline();
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido) {
      grupo.removeAttribute('mask');
      gsap.set(grupo, { opacity: 1 });
      return gsap.timeline();
    }
    const trazos = prepararTrazos();
    gsap.set(grupo, { opacity: 1 });
    const tl = gsap.timeline({ delay: retraso, onComplete: () => grupo.removeAttribute('mask') });
    const duraciones = [0.72, 0.42, 0.86];
    const solapes = [0, -0.1, -0.06];
    const radioPluma = cajas.uri.height * 0.035;

    tl.set(pluma, { attr: { r: radioPluma }, opacity: 1 }, 0);
    trazos.forEach((t, i) => {
      tl.to(
        t.path,
        {
          strokeDashoffset: 0,
          duration: duraciones[i],
          ease: i === 1 ? 'power1.in' : 'power1.inOut',
          onUpdate() {
            const avance = 1 - parseFloat(t.path.style.strokeDashoffset) / t.largo;
            const p = t.path.getPointAtLength(Math.min(Math.max(avance, 0), 1) * t.largo);
            pluma.setAttribute('cx', p.x);
            pluma.setAttribute('cy', p.y);
          },
        },
        i === 0 ? 0 : `>${solapes[i]}`
      );
    });
    tl.set(pluma, { opacity: 0 }, '>-0.02');
    return tl;
  }

  return {
    svg,
    grupo,
    maquetar,
    escribir,
    get cajas() {
      return cajas;
    },
    ocultar() {
      gsap.set(grupo, { opacity: 0 });
    },
  };
}

// Monta la firma en un contenedor y la maqueta cuando las fuentes están listas.
export async function montarFirma(contenedor, opciones) {
  const firma = crearFirma(opciones);
  contenedor.append(firma.svg);
  try {
    await document.fonts.load('100px Roycella');
    await document.fonts.ready;
  } catch (e) {
    /* la fuente puede fallar: se maqueta igual con la de respaldo */
  }
  firma.maquetar();

  // Si Roycella llega tarde, las medidas cambian: se vuelve a maquetar.
  for (const ms of [250, 800, 2000, 4000]) setTimeout(() => firma.maquetar(), ms);
  if (document.fonts) {
    const remedir = () => firma.maquetar();
    document.fonts.addEventListener('loadingdone', remedir);
    setTimeout(() => document.fonts.removeEventListener('loadingdone', remedir), 10000);
  }

  return firma;
}
