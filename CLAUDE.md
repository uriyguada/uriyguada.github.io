# Uri & Guada — web de porfolio

Porfolio de una dupla creativa: **Uri** (dirección de arte) y **Guada** (redacción). Estética de cine: entradas, afiches, sala oscura, papel con grano. Ocho ideas, cada una es una "función".

Este archivo son las reglas del proyecto. El detalle de pantallas e interacciones está en `docs/ESPEC.md`. El contenido está en `src/data/proyectos.js`. El diseño aprobado está en `referencias/` (capturas + las placas fuente en HTML).

## Reglas que no se negocian

- **Nada de textos de más.** Solo los textos que están en `src/data/proyectos.js` y en las placas. No agregar bajadas, descripciones, "sobre nosotros", fechas, tags, contadores, "scroll", "cargando", tooltips explicativos ni microcopy inventado. Si falta un texto, preguntar.
- **Sin reseñas escritas.** Solo estrellas.
- **Clari:** la marca es spoiler. Se muestra como `★` en todos lados. No escribir el nombre de la marca en ningún lugar del sitio: ni en textos, ni en alt, ni en meta tags, ni en nombres de archivo, ni en comentarios de código.
- Se dice **porfolio** (no "portfolio", no "folio").
- Fotos de proyectos y de la dupla: siempre en **duotono** con el color de la entrada (ver "Duotono").
- Idioma: español rioplatense. `lang="es"`.
- Respetar exactamente colores, tipografías y proporciones de `referencias/capturas`. Ante una duda de diseño, la placa manda.

## Stack

- **Vite + JavaScript vanilla** (sin framework). HTML semántico, CSS propio (sin Tailwind), módulos ES.
- **GSAP** (con Flip, Draggable, InertiaPlugin y Observer; hoy todos son gratis) para la rotura del ticket, el visor horizontal y la tierlist.
- Sitio estático publicado en **GitHub Pages** con un workflow de GitHub Actions (`.github/workflows/deploy.yml`, build de Vite → `actions/deploy-pages`).
- Navegación con hash (`#/funcion/spotifuck`) para que funcione en Pages sin 404.
- Sin backend. La tierlist y las estrellas que pone cada visitante se guardan en `localStorage`.

## Sistema visual

Colores base:

| Token | Hex | Uso |
|---|---|---|
| `--papel` | `#EEE6D3` | fondo principal |
| `--papel-claro` | `#F6EEDC` | talón de las entradas, marcos de fotos |
| `--tinta` | `#1B1916` | texto, bordes de 2–3 px, fondos oscuros |
| `--sala` | `#141210` | hero, sección contacto, fondo del videocaso |
| `--rojo` | `#BA0101` | CTA "SACÁ TU ENTRADA", el `&`, estados activos |
| `--dorado` | `#E99D25` | estrellas activas, selección |
| `--gris` | `#B9AF9C` | footer, estrellas vacías |

Cada proyecto tiene `color` (entrada), `tinta` (texto sobre la entrada) y `heroBg` (fondo del hero de su ficha). Están en el archivo de datos.

Tipografías:

- **Advercase** (`/public/fonts`): títulos de sección como "Cartelera", "Videocaso", "Board", "Las piezas". Es una **demo sin tildes ni ñ**: usarla solo en palabras sin acento.
- **Roycella** (`/public/fonts/Roycella.ttf`): firma "Uri & Guada" y los nombres "Uri" y "Guada". Tiene la misma restricción.
  - Las dos fuentes son de uso personal. Dejar un `TODO` visible en el README: hay que comprar las licencias antes de publicar.
- **Archivo Narrow** (Google Fonts, 400–700): títulos de proyecto en mayúsculas, navegación, botones y "DUPLA CREATIVA".
- **Courier Prime** (Google Fonts, 400/700): metadatos (FUNCIÓN 04, marca), loglines, créditos y contacto.
- Cargar con `font-display: swap` y precargar Roycella y Archivo Narrow 700.

Textura: `/public/textura/grano.png` en `mix-blend-mode: multiply` sobre toda la página, con opacidad **0.15** (un `body::after` fijo con `pointer-events: none`).

Duotono: el contenedor tiene `background: <color>` y la imagen lleva `filter: grayscale(1) contrast(1.25) brightness(1.08); mix-blend-mode: multiply`. Las fotos de la dupla ya están aclaradas para que el duotono no quede empastado.

Formas:

- **Muesca de entrada:** semicírculos calados en los laterales, con una `mask` de `radial-gradient` de radio 16 px (34–40 px en las piezas grandes). Copiar las clases `.notch` y `.notch-big` de las placas.
- **Talón:** franja de 104 px en `--papel-claro`, separada por un borde punteado de 3 px del color `tinta`. Lleva "Uri & Guada" en vertical (Advercase) y un código de barras hecho con CSS.
- **Pegatinas del hero de cada ficha:** posiciones y estilos exactos en las clases `.s1`–`.s4` de `referencias/placas/Ficha.dc.html`. El s2 es un sello SVG con el texto en anillo.

## Calidad

- Responsive de 360 a 1920 px. En mobile se sigue a `referencias/capturas/2*-mobile-*.jpg`, y lo que no tenga placa se adapta con el mismo criterio.
- Accesible:
  - Todo lo que se puede tocar se puede usar con teclado.
  - Foco visible: contorno dorado.
  - `alt` en todas las imágenes, sacados del archivo de datos.
  - `prefers-reduced-motion`: sacar las animaciones grandes y dejar fundidos cortos.
- Rápido:
  - Imágenes en AVIF/WebP con fallback a JPG, generadas en el build (por ejemplo con `vite-imagetools` o un script con `sharp`).
  - `loading="lazy"` en todo lo que queda debajo del pliegue.
  - Los videos se cargan solo cuando su ficha está activa (`preload="none"`).
- Probar con Playwright en desktop y mobile antes de dar algo por terminado. Sacar capturas y compararlas con `referencias/capturas`.
