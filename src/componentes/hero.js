// Hero: la dupla como una entrada partida al medio y la firma escrita con tinta.
import gsap from 'gsap';
import { dupla } from '../data/proyectos.js';
import { montarFirma } from './firma.js';
import { estaSilenciado, alternarSilencio } from '../lib/sonido.js';

const [uri, guada] = dupla.personas;

const ICONO_SONIDO = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" fill="currentColor"/><path class="onda-1" d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path class="onda-2" d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/><path class="cruz" d="M15.5 9.5l5 5M20.5 9.5l-5 5"/></svg>`;

export function montarHero(seccion) {
  seccion.innerHTML = `
    <div class="hero__interior">
      <header class="barra">
        <nav class="barra__nav" aria-label="Secciones">
          <a href="#cartelera">Cartelera</a>
          <a href="#tierlist">Tierlist</a>
        </nav>
        <div class="barra__fin">
          <button class="sonido" type="button" aria-pressed="false" aria-label="Silenciar el sonido">${ICONO_SONIDO}</button>
          <a class="boton-rojo muesca" href="#entrada">SACÁ TU ENTRADA</a>
        </div>
      </header>

      <div class="entrada-dupla">
        <div class="entrada-dupla__mitad entrada-dupla__mitad--uri duo" style="background:${uri.color}">
          <img src="${uri.foto}" alt="Uri de espaldas en la sala, mirando la pantalla" style="object-position:40% 50%">
        </div>
        <div class="entrada-dupla__mitad entrada-dupla__mitad--guada duo" style="background:${guada.color}">
          <img src="${guada.foto}" alt="Guada de espaldas en la sala, con pochoclos y gaseosa" style="object-position:50% 58%">
        </div>
        <span class="entrada-dupla__troquel" aria-hidden="true"></span>
        <span class="entrada-dupla__ojal entrada-dupla__ojal--a" aria-hidden="true"></span>
        <span class="entrada-dupla__ojal entrada-dupla__ojal--b" aria-hidden="true"></span>
        <h1 class="hero__firma"><span class="hero__firma-h"></span><span class="hero__firma-v"></span></h1>
      </div>

      <p class="hero__bajada"><span class="hero__filete"></span>${dupla.bajada}<span class="hero__filete"></span></p>
    </div>
  `;

  const botonSonido = seccion.querySelector('.sonido');
  const pintarSonido = () => {
    const mudo = estaSilenciado();
    botonSonido.classList.toggle('sonido--mudo', mudo);
    botonSonido.setAttribute('aria-pressed', String(mudo));
    botonSonido.setAttribute('aria-label', mudo ? 'Activar el sonido' : 'Silenciar el sonido');
  };
  botonSonido.addEventListener('click', () => {
    alternarSilencio();
    pintarSonido();
  });
  pintarSonido();

  montarFirmas(seccion);
}

function mostrarTodo(mitades, troquel, bajada, firma) {
  gsap.set([...mitades, ...troquel], { clearProps: 'all' });
  gsap.set(troquel, { scale: 1, scaleX: 1, scaleY: 1 });
  gsap.set(bajada, { clipPath: 'inset(0 0% 0 0)' });
  firma.grupo.removeAttribute('mask');
  gsap.set(firma.grupo, { opacity: 1 });
}

async function montarFirmas(seccion) {
  const cajas = {
    horizontal: seccion.querySelector('.hero__firma-h'),
    vertical: seccion.querySelector('.hero__firma-v'),
  };
  const comun = { colorNombre: '#EEE6D3', colorAmp: '#BA0101', sombra: true };
  const firmas = {};
  const enMobile = () => window.matchMedia('(max-width: 720px)').matches;

  // Solo se maqueta la variante visible: la escondida mide 0 y no se puede medir.
  async function asegurar(variante) {
    if (!firmas[variante]) {
      firmas[variante] = await montarFirma(cajas[variante], { ...comun, variante });
    } else {
      firmas[variante].maquetar();
    }
    return firmas[variante];
  }

  const activa = await asegurar(enMobile() ? 'vertical' : 'horizontal');

  // Si la pestaña nunca se pinta, GSAP no arranca: recién acá se esconde nada.
  await new Promise((r) => requestAnimationFrame(r));
  activa.ocultar();

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mitades = seccion.querySelectorAll('.entrada-dupla__mitad');
  const linea = seccion.querySelector('.entrada-dupla__troquel');
  const ojales = seccion.querySelectorAll('.entrada-dupla__ojal');
  const troquel = [linea, ...ojales];
  const bajada = seccion.querySelector('.hero__bajada');

  // Nada aparece con fundido: las mitades entran desde los costados y encastran,
  // el troquel se dibuja y la bajada se descubre de izquierda a derecha.
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (reducido) {
    mostrarTodo(mitades, troquel, bajada, activa);
  } else {
    tl.from(mitades[0], { xPercent: enMobile() ? 0 : -104, yPercent: enMobile() ? -104 : 0, duration: 0.68 }, 0)
      .from(mitades[1], { xPercent: enMobile() ? 0 : 104, yPercent: enMobile() ? 104 : 0, duration: 0.68 }, 0)
      .from(linea, enMobile() ? { scaleX: 0, duration: 0.4 } : { scaleY: 0, duration: 0.4 }, 0.45)
      .from(ojales, { scale: 0, duration: 0.35, ease: 'back.out(2)' }, 0.58)
      .call(() => activa.escribir(), null, 0.55)
      .from(bajada, { clipPath: 'inset(0 100% 0 0)', duration: 0.5, ease: 'power2.inOut' }, 2.35);

    // Red de seguridad: si el reloj de GSAP nunca corrió, se deja todo en su lugar.
    setTimeout(() => {
      if (gsap.ticker.time > 0) return;
      tl.kill();
      mostrarTodo(mitades, troquel, bajada, activa);
    }, 5000);
  }

  // Al cruzar el corte de mobile se maqueta la otra variante (recién ahí se puede medir).
  const mq = window.matchMedia('(max-width: 720px)');
  mq.addEventListener('change', async () => {
    const firma = await asegurar(enMobile() ? 'vertical' : 'horizontal');
    firma.grupo.removeAttribute('mask');
    gsap.set(firma.grupo, { opacity: 1 });
  });

  window.addEventListener('resize', () => {
    clearTimeout(montarFirmas._t);
    montarFirmas._t = setTimeout(() => {
      const firma = firmas[enMobile() ? 'vertical' : 'horizontal'];
      if (firma) firma.maquetar();
    }, 200);
  });
}
