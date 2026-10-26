// Dibuja la tierlist en un canvas de 1080×1350 y la descarga.
import { proyectos, tiers } from '../data/proyectos.js';

const ANCHO = 1080;
const ALTO = 1350;

function cargarImagen(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function recortar(ctx, img, x, y, w, h) {
  if (!img) return;
  const escala = Math.max(w / img.width, h / img.height);
  const dw = img.width * escala;
  const dh = img.height * escala;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

export async function descargarTierlist(estado) {
  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext('2d');

  try {
    await document.fonts.load('700 40px "Archivo Narrow"');
    await document.fonts.load('400 70px Roycella');
    await document.fonts.ready;
  } catch (e) {
    /* se dibuja con lo que haya */
  }

  const imgs = new Map();
  await Promise.all(
    proyectos.map(async (p) => imgs.set(p.slug, await cargarImagen(p.ticket.img)))
  );
  const grano = await cargarImagen('/textura/grano.png');

  ctx.fillStyle = '#EEE6D3';
  ctx.fillRect(0, 0, ANCHO, ALTO);

  ctx.fillStyle = '#1B1916';
  ctx.font = '700 104px "Archivo Narrow", sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('TIERLIST', 60, 150);

  const margen = 60;
  const anchoRotulo = 190;
  const alto = 168;
  const separacion = 8;
  let y = 210;

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    ctx.fillStyle = '#26221E';
    ctx.fillRect(margen, y, ANCHO - margen * 2, alto);
    ctx.fillStyle = t.color;
    ctx.fillRect(margen, y, anchoRotulo, alto);

    ctx.fillStyle = '#1B1916';
    ctx.font = '700 30px "Archivo Narrow", sans-serif';
    ctx.textAlign = 'center';
    const palabras = t.label.toUpperCase().split(' ');
    palabras.forEach((p, k) => {
      ctx.fillText(p, margen + anchoRotulo / 2, y + alto / 2 + 10 + (k - (palabras.length - 1) / 2) * 32);
    });
    ctx.textAlign = 'left';

    const enFila = proyectos.filter((p) => estado[p.slug] === i);
    let x = margen + anchoRotulo + 14;
    for (const p of enFila) {
      dibujarMini(ctx, p, imgs.get(p.slug), x, y + 10, 118, alto - 20);
      x += 130;
      if (x > ANCHO - margen - 118) break;
    }
    y += alto + separacion;
  }

  const pozo = proyectos.filter((p) => estado[p.slug] === undefined);
  if (pozo.length) {
    y += 20;
    ctx.strokeStyle = '#1B1916';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(margen, y, ANCHO - margen * 2, alto);
    ctx.setLineDash([]);
    let x = margen + 14;
    for (const p of pozo) {
      dibujarMini(ctx, p, imgs.get(p.slug), x, y + 10, 118, alto - 20);
      x += 130;
      if (x > ANCHO - margen - 118) break;
    }
    y += alto;
  }

  ctx.fillStyle = '#BA0101';
  ctx.font = '400 92px Roycella, cursive';
  ctx.textAlign = 'right';
  ctx.fillText('Uri & Guada', ANCHO - margen, ALTO - 60);
  ctx.textAlign = 'left';

  if (grano) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.globalCompositeOperation = 'multiply';
    const patron = ctx.createPattern(grano, 'repeat');
    ctx.fillStyle = patron;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    ctx.restore();
  }

  const enlace = document.createElement('a');
  enlace.download = 'tierlist-uri-y-guada.png';
  const blob = await new Promise((r) => lienzo.toBlob(r, 'image/png'));
  if (!blob) return;

  const archivo = new File([blob], enlace.download, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo] });
      return;
    } catch (e) {
      /* si se cancela, se descarga */
    }
  }
  enlace.href = URL.createObjectURL(blob);
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
}

function dibujarMini(ctx, p, img, x, y, w, h) {
  const altoFoto = Math.round(h * 0.65);
  ctx.fillStyle = p.color;
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.filter = 'grayscale(1) contrast(1.25) brightness(1.08)';
  recortar(ctx, img, x, y, w, altoFoto);
  ctx.restore();

  ctx.strokeStyle = p.tinta;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(x, y + altoFoto);
  ctx.lineTo(x + w, y + altoFoto);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = p.tinta;
  ctx.font = '700 15px "Archivo Narrow", sans-serif';
  ctx.textAlign = 'center';
  const lineas = quebrar(ctx, p.titulo, w - 10);
  lineas.slice(0, 3).forEach((linea, i) => {
    ctx.fillText(linea, x + w / 2, y + altoFoto + 24 + i * 16);
  });
  ctx.textAlign = 'left';
}

function quebrar(ctx, texto, ancho) {
  const palabras = texto.split(' ');
  const lineas = [];
  let actual = '';
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > ancho && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}
