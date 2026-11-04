// About: una ventana que sube desde abajo con los dos perfiles, cada uno con su tira de negativo.
// Se abre desde la barra de arriba y desde el botón de abajo del contacto; vive en #/about.
import gsap from 'gsap';
import { about } from '../data/about.js';
import { sonar } from '../lib/sonido.js';

const FOTOGRAMAS = ['12A', '14', '16A', '18', '20A'];

function perfilHTML(p) {
  const mitad = Math.ceil(p.texto.length / 2);
  const parrafos = (lista) => lista.map((t) => `<p>${t}</p>`).join('');
  return `
    <section class="perfil" style="--color:${p.color}" aria-label="${p.nombre}">
      <h2 class="perfil__nombre roy">${p.nombre}</h2>
      <div class="rollo">
        <div class="rollo__tira">
          <div class="rollo__pista">
            <div class="rollo__perf"></div>
            <div class="rollo__cuadros">
              ${p.fotos
                .map(
                  (f, k) => `
                <figure class="rollo__cuadro">
                  <span class="rollo__foto duo"><img src="${f.img}" alt="${f.alt}" loading="lazy" draggable="false" style="object-position:${f.pos}"></span>
                  <figcaption class="rollo__numero mono">▸ ${FOTOGRAMAS[k]}</figcaption>
                </figure>`
                )
                .join('')}
            </div>
            <div class="rollo__perf"></div>
          </div>
        </div>
      </div>
      <div class="perfil__texto">
        <div class="perfil__col">${parrafos(p.texto.slice(0, mitad))}</div>
        <div class="perfil__col">
          ${parrafos(p.texto.slice(mitad))}
          <div class="estudios mono">
            <div class="estudios__rotulo">ESTUDIOS</div>
            ${p.estudios
              .map(([titulo, donde]) => `<div class="estudios__fila"><b>${titulo}</b><span>${donde}</span></div>`)
              .join('')}
          </div>
        </div>
      </div>
    </section>`;
}

export function montarAbout() {
  const capa = document.createElement('div');
  capa.className = 'about';
  capa.hidden = true;
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-label', 'About');
  capa.innerHTML = `
    <div class="about__fondo"></div>
    <div class="about__escena">
      <div class="about__ventana">
        <div class="about__scroll" tabindex="0">${about.map(perfilHTML).join('')}</div>
      </div>
    </div>
    <button type="button" class="visor__cerrar about__cerrar" aria-label="Cerrar"><span></span><span></span></button>`;
  document.body.append(capa);

  const scroll = capa.querySelector('.about__scroll');
  const perfiles = [...capa.querySelectorAll('.perfil')];
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escritorio = () => window.matchMedia('(min-width: 721px)').matches;
  let abierto = false;

  // ---- revelado: la tira entra desde el costado y los cuadros aparecen como en el revelador ----
  function preparar() {
    perfiles.forEach((perfil, k) => {
      perfil.dataset.revelado = '';
      gsap.set(perfil.querySelector('.rollo__pista'), { x: k % 2 ? -120 : 120 });
      gsap.set(perfil.querySelectorAll('.rollo__foto'), { filter: 'brightness(0.2)' });
    });
  }

  function revelar(perfil) {
    if (perfil.dataset.revelado === 'si') return;
    perfil.dataset.revelado = 'si';
    gsap.to(perfil.querySelector('.rollo__pista'), { x: 0, duration: 0.9, ease: 'power3.out' });
    gsap.to(perfil.querySelectorAll('.rollo__foto'), {
      filter: 'brightness(1)',
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08,
      delay: 0.15,
      clearProps: 'filter',
    });
  }

  const mirador =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entradas) => entradas.forEach((e) => e.isIntersecting && revelar(e.target)),
          { root: scroll, threshold: 0.2 }
        )
      : null;

  // ---- parallax: cada tira se corre un poco en sentido contrario al scroll, Uri y Guada al revés ----
  function paralaje() {
    if (!abierto || reducido() || !escritorio()) return;
    const alto = scroll.clientHeight;
    const arriba = scroll.getBoundingClientRect().top;
    perfiles.forEach((perfil, k) => {
      const rollo = perfil.querySelector('.rollo');
      const r = rollo.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top - arriba + r.height / 2 - alto / 2) / alto));
      rollo.style.setProperty('--corrida', `${(p * 30 * (k % 2 ? -1 : 1)).toFixed(1)}px`);
    });
  }
  let cuadro = 0;
  scroll.addEventListener('scroll', () => {
    cancelAnimationFrame(cuadro);
    cuadro = requestAnimationFrame(paralaje);
  });

  function abrir({ conSonido = true } = {}) {
    if (abierto) return;
    abierto = true;
    if (conSonido) sonar('abrir');
    capa.classList.remove('about--bajando');
    capa.hidden = false;
    document.body.classList.add('con-about');
    scroll.scrollTop = 0;
    if (location.hash === '#/about') history.replaceState({ about: true }, '', '#/about');
    else history.pushState({ about: true }, '', '#/about');

    if (!reducido()) {
      preparar();
      capa.classList.add('about--subiendo');
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          capa.classList.remove('about--subiendo');
          paralaje();
          perfiles.forEach((perfil) => mirador && mirador.observe(perfil));
          if (!mirador) perfiles.forEach(revelar);
        })
      );
    }
    scroll.focus({ preventScroll: true });
  }

  function cerrar({ volverUrl = true } = {}) {
    if (!abierto) return;
    // como en el visor: volver atrás es lo que cierra, así el botón Atrás no la reabre
    if (volverUrl && location.hash === '#/about') {
      history.back();
      return;
    }
    abierto = false;
    sonar('cerrar');
    if (mirador) mirador.disconnect();
    const terminar = () => {
      capa.hidden = true;
      capa.classList.remove('about--bajando');
      document.body.classList.remove('con-about');
    };
    if (reducido()) {
      terminar();
      return;
    }
    capa.classList.add('about--bajando');
    setTimeout(terminar, 420);
  }

  capa.querySelector('.about__cerrar').addEventListener('click', () => cerrar());
  capa.querySelector('.about__fondo').addEventListener('click', () => cerrar());
  capa.querySelector('.about__escena').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) cerrar();
  });
  window.addEventListener('keydown', (e) => {
    if (abierto && e.key === 'Escape') cerrar();
  });
  capa.addEventListener('dragstart', (e) => e.preventDefault());

  document.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-abrir-about]');
    if (!boton) return;
    e.preventDefault();
    abrir();
  });

  window.addEventListener('popstate', () => {
    if (location.hash === '#/about') abrir({ conSonido: false });
    else if (abierto) cerrar({ volverUrl: false });
  });

  if (location.hash === '#/about') abrir({ conSonido: false });

  return { abrir, cerrar };
}
