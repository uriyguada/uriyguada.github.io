# Uri & Guada — web de porfolio

Paquete listo para que Claude Code arme la web y la publique en GitHub Pages.

## Cómo usarlo

1. Abrí Claude Code en esta carpeta (`ideas proyectos/uri-y-guada-web`).
2. Pegale el texto de `PROMPT.md`.
3. Claude Code lee `CLAUDE.md` solo. Ahí están las reglas del proyecto.

## Qué hay en la carpeta

| Ruta | Qué es |
|---|---|
| `PROMPT.md` | El mensaje para pegar en Claude Code |
| `CLAUDE.md` | Reglas, stack y sistema visual (Claude Code lo lee siempre) |
| `docs/ESPEC.md` | Cada pantalla e interacción en detalle: rotura del ticket, visor horizontal, tierlist, reproductor |
| `src/data/proyectos.js` | Todo el contenido: textos, colores, pegatinas, imágenes, videos y contactos |
| `public/img/` | Imágenes de los 8 proyectos y las fotos de Uri y Guada |
| `public/fonts/` | Advercase y Roycella |
| `public/sound/` | 3 variantes del sonido de la entrada rompiéndose (webm + mp3) |
| `public/textura/grano.png` | Grano de papel |
| `referencias/capturas/` | Capturas de cada placa aprobada, más las 2 referencias del visor |
| `referencias/placas/` | Las placas fuente en HTML, para sacar medidas exactas |

Los videos no están acá: Claude Code los comprime desde la carpeta de arriba.

## Pendientes (TODO)

- [ ] **Comprar las licencias de Advercase y Roycella.** El sitio ya está publicado con las demos. Las que hay son demos de uso personal y no tienen tildes ni ñ.
- [ ] Opcional: reemplazar `public/sound/ticket-rotura*.webm` por una grabación real de una entrada rompiéndose. Los sonidos actuales están sintetizados.
- [ ] Imagen de Open Graph de 1200×630 (hoy el link no muestra preview al compartirlo).
- [ ] Revisar las versiones mobile en un teléfono real.
- [ ] Los videos pesan 93 MB en total (ninguno pasa los 25 MB). Entran en GitHub Pages, pero si el repo queda pesado, la
      alternativa es subirlos a Vimeo sin listar y usar el mismo reproductor con su API.

## Estado del código

La web está publicada en **https://uriyguada.github.io/** y construida con Vite + JS vanilla + GSAP,
siguiendo `referencias/placas/`. Cada push a `main` dispara el workflow de Actions, que buildea y
deploya a Pages (la fuente de Pages tiene que quedar en "GitHub Actions", no en "branch").

```bash
npm install
npm run dev     # http://localhost:5181
npm run build   # dist/
```

| Parte | Estado |
|---|---|
| Hero (entrada partida, firma con el `&` integrado, escritura en tinta) | Hecho |
| Cartelera: 8 entradas + rotura con sonido | Hecho (abre la ficha; al cerrar, la entrada se recompone) |
| Sacá tu entrada | Hecho (el mail se copia y el talón sella) |
| Tierlist: arrastre, elegir y colocar, reiniciar, PNG 1080×1350 | Hecho |
| Mobile (360–720) | Hecho |
| Visor horizontal + fichas de los 8 proyectos | Hecho (flechas, teclado, rueda, arrastre, URL `#/funcion/slug`) |
| Videocasos + reproductor A (línea) | Hecho: los 6 videos comprimidos a 1080p en `public/video/` |
| Publicación | Hecho: **https://uriyguada.github.io/** (repo `uriyguada/uriyguada.github.io`) |

### El logo

El hero es el logo animado que hizo Uri (`public/logo/uri-y-guada-{horizontal,vertical}.webm`, con transparencia) y "DUPLA CREATIVA". Safari e iOS no muestran la transparencia de un webm: ahí se usa la versión en WebP animado (`.webp`). Con `prefers-reduced-motion` va el SVG quieto.

### Decisiones de Uri

- En escritorio la página va con `zoom: .5` (como Chrome al 50%), ver `base.css`. Ningún texto baja de 10 px en pantalla (`--min-txt`). Lo que se mide contra la ventana usa `--z` y `src/lib/zoom.js`.
- Sin menú arriba, sin rotura de la entrada, sin flechas ni contador en el visor, sin pestañas, créditos, fotos ni pegatinas en la portada de la ficha, y el board sin marco.
- La función 07 ahora es Rediscovering Sunsets (Corona), en lugar de Cód1gos d3 r3un10n.
- Las tierlists llegan por mail con Formspree (`mbggyvva`): el visitante pone NOMBRE y AGENCIA / ESCUELA, y se mandan también sus estrellas.

- Adentro del visor, la ficha entra al 75% (`--esc` en `visor.js`): con el tamaño de la placa
  se veía todo muy grande.
- No va el promedio de estrellas: queda solo "TU CALIFICACIÓN".
- No se ven las barras de scroll, ni en la página ni adentro del panel.

### Animaciones

Nada entra ni sale con fundido (es un pedido de Uri): todo se mueve, se dibuja o se descubre.
Las mitades del hero entran desde los costados, el troquel se dibuja, la bajada se descubre de
izquierda a derecha, el talón de la entrada se corta y cae, y el visor abre y cierra con un
barrido circular desde la entrada que se tocó.
