Copiá todo lo que está debajo de la línea y pegalo en Claude Code, abierto en esta carpeta (`uri-y-guada-web`).

---

Vamos a construir y publicar la web de porfolio de mi dupla creativa, **Uri & Guada**. El diseño ya está aprobado: no lo rediseñes, construilo.

Antes de escribir código, leé en este orden:
1. `CLAUDE.md` (reglas, stack y sistema visual)
2. `docs/ESPEC.md` (pantallas e interacciones, con todo el detalle)
3. `src/data/proyectos.js` (todo el contenido; no inventes textos)
4. Mirá todas las imágenes de `referencias/capturas/` y usá `referencias/placas/*.dc.html` para sacar medidas, colores y estilos exactos. Las placas son HTML con estilos inline; `{{…}}` son variables y `<sc-for>` es un bucle.

Qué tiene que tener:
- Una sola página, en este orden: **hero** (las fotos de Uri y Guada como una entrada partida en dos, el nombre con el `&` integrado sobre el troquel y "DUPLA CREATIVA"), **cartelera** (8 entradas), **sacá tu entrada** (mail, WhatsApp y LinkedIn de cada uno por separado) y **tierlist**.
- Al hacer click en una entrada de la cartelera, **la entrada se rompe** por el troquel, con sonido ASMR de papel (`public/sound/`), y se transforma en la ficha del proyecto.
- Las fichas se abren en un **visor horizontal**: se pasa de un proyecto al siguiente scrolleando o swipeando en horizontal, con las fichas vecinas asomando a los costados. No hay pantallas de carga ni hay que volver atrás. Referencias: `referencias/capturas/02-visor-fichas.jpg`, `ref-visor-disney.png` y `ref-visor-emperagoat.png`.
- **Tierlist** con drag & drop muy bien animado: agarrar, arrastrar y soltar. Categorías: Obra maestra · Cine · Está bien · Me dormí · Mucha merd.
- Reproductor de video: la **variante A (línea)**.

Cómo trabajar:
1. Armá un plan corto con TodoWrite y arrancá. Usá Vite + JS vanilla + GSAP, como dice `CLAUDE.md`.
2. Comprimí los videos de `../` a `public/video/` con el comando de `docs/ESPEC.md` → "Videos".
3. Construí por partes: sistema visual (tokens, fuentes, grano, duotono, muescas) → hero → cartelera → rotura del ticket → visor horizontal → fichas → reproductor → contacto → tierlist → mobile.
4. Después de cada parte, levantá el sitio y sacá capturas con Playwright en 1440 y en 390 de ancho. Comparalas con `referencias/capturas` y corregí hasta que coincidan. Mostrame las capturas de las partes importantes.
5. Las animaciones (rotura, visor, tierlist) se prueban en el navegador: grabá un video corto con Playwright de cada una y revisalo cuadro a cuadro antes de darla por buena.
6. Al final, preguntame el nombre de la organización y del repo de GitHub (propuesta: `uriyguada/uriyguada.github.io`), crealo con `gh`, configurá GitHub Pages con Actions, publicá y pasame la URL.

Reglas que importan: nada de textos de más, nada de reseñas escritas (solo estrellas), la marca de Clari nunca se escribe (es ★) y siempre se dice "porfolio".
