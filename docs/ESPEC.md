# Especificación: pantallas e interacciones

El sitio es **una sola página** (la home) y un **visor de fichas** que se abre encima. No hay otras páginas, ni pantallas de carga, ni "volver" para pasar de un proyecto a otro.

```
HOME (scroll vertical)
 ├─ 1. Hero: Uri & Guada + fotos + DUPLA CREATIVA
 ├─ 2. Cartelera: 8 entradas  ──click──►  la entrada se rompe ──►  VISOR (overlay)
 ├─ 3. Sacá tu entrada: contacto de cada uno                          ├─ ficha activa: scroll vertical
 ├─ 4. Tierlist                                                       └─ ←  →  scroll horizontal entre fichas
 └─ footer
```

Captura de referencia de cada parte: `referencias/capturas/01-home.jpg` y `02-visor-fichas.jpg`. Las placas fuente son `referencias/placas/Main.dc.html` y `Visor.dc.html`: son HTML con estilos inline (`{{…}}` son variables, `<sc-for>` es un bucle), así que se pueden copiar valores exactos.

---

## 1. Hero

- Fondo `--sala`. Arriba hay una barra con "CARTELERA" y "TIERLIST" a la izquierda (ancla a cada sección) y, a la derecha, el botón rojo con muescas "SACÁ TU ENTRADA" (ancla al contacto).
- **Una entrada partida en dos:** dos fotos de 640×780 (desktop).
  - Izquierda: Uri, duotono rosa `#EBA5B3`.
  - Derecha: Guada, duotono celeste `#8EC8D2`.
  - Entre las dos hay un troquel punteado vertical de 4 px del color de la sala, con un semicírculo calado arriba y otro abajo, como dos talones de la misma entrada.
  - Las esquinas exteriores tienen radio de 22 px y una muesca de 34 px en cada lateral.
- **Nombre integrado:** "Uri" y "Guada" en Roycella crema (`#EEE6D3`, ~250 px), apoyados sobre la parte baja de las fotos. El **`&`**, en Roycella rojo `#BA0101` y ~430 px, va montado justo sobre el troquel: une las dos mitades y se pisa con la "i" de Uri y con la "G" de Guada. Sale un poco por debajo de la entrada. Los nombres llevan una sombra suave para leerse sobre la foto. Es un `<h1>` con el texto "Uri & Guada".
- Debajo, centrado: una línea, "DUPLA CREATIVA" (Archivo Narrow 700, 30 px, tracking 0.42em) y otra línea.
- Entrada:
  - Las dos mitades llegan desde los costados y "encastran" en el troquel (600 ms, `power3.out`).
  - El `&` aparece trazándose con un `clip-path` que se abre en diagonal, o con un fundido y escala de 0.9 a 1.
  - Por último aparece la bajada.
- Mobile:
  - La entrada se para en vertical: Uri arriba, Guada abajo y el troquel horizontal.
  - El `&` queda centrado sobre el troquel.
  - "Uri" va sobre la foto de arriba y "Guada" sobre la de abajo.

## 2. Cartelera

- Título "Cartelera" en Advercase, 200 px, con un filete de 2 px abajo.
- Grilla de 2 columnas (1 en mobile) con las 8 entradas en el orden del archivo de datos. Cada una tiene una rotación sutil de ±1° (`ticket.rot`).
- Anatomía de la entrada (312 px de alto en desktop):
  - **Cuerpo**, con el `color` del proyecto:
    - foto en duotono, con marco de 6 px `--papel-claro`;
    - arriba, "FUNCIÓN 0X" y `marcaTicket` en Courier 13 px, con un filete de 2 px del color `tinta`;
    - abajo, el título del proyecto en Archivo Narrow 700 de 58 px.
  - **Talón** de 104 px.
- Hover: la entrada sube 6 px y se endereza (0°), en 350 ms. El cursor es pointer.
- **Click → la entrada se rompe** (ver más abajo) y se abre el visor en ese proyecto.

### Rotura del ticket con sonido de papel

Es el momento más importante de la web: tiene que sentirse físico.

1. **Sonido.** Al tocar, se reproduce uno de los tres sonidos al azar (`/public/sound/ticket-rotura{,-2,-3}.webm` con fallback a `.mp3`):
   - Usar la **Web Audio API**: decodificar los tres en un `AudioBuffer` al cargar la página, para que no haya latencia.
   - `playbackRate` aleatorio entre 0.92 y 1.08 para que nunca suene igual.
   - Volumen 0.8.
   - El `AudioContext` se crea o se reanuda en el primer gesto del usuario.
   - En el hero hay un botón chico, solo con ícono de parlante (sin texto), para silenciar. La elección se guarda en `localStorage`.
   - Los sonidos actuales son sintetizados. Si Uri trae una grabación real de una entrada rompiéndose, se reemplaza el archivo y listo.
2. **Animación** (GSAP timeline, ~900 ms en total; los tiempos tienen que coincidir con el sonido, que dura 0.6 s):
   - **0–150 ms · tensión.** El cuerpo tira 4 px hacia la izquierda y gira 1°. El talón tira hacia la derecha y gira −2°. Aparece el borde dentado en la línea de troquel: un zigzag hecho con `clip-path` o máscara SVG en el borde derecho del cuerpo y en el izquierdo del talón, con fibras de papel claro asomando.
   - **150–600 ms · se rompe.** El talón se separa, gira hasta ~30° y cae con gravedad (`power2.in`) mientras se desvanece. El cuerpo se eleva un poco (sube 6 px, escala 1.01).
   - **450–900 ms · se abre.** Con **GSAP Flip**, el cuerpo de la entrada se transforma en el panel del visor: crece desde su posición hasta el panel centrado, cambia de `color` a `heroBg` y redondea las esquinas a 32 px. Al final entra el contenido de la ficha (cascada de 40 ms entre elementos).
   - En mobile: `navigator.vibrate(12)` en el momento de la rotura, si existe.
3. **Al cerrar el visor** se hace el camino inverso: el panel se achica hasta su entrada y la entrada se recompone, con el talón volviendo a su lugar (sin sonido, o con un "tic" suave).
4. Con `prefers-reduced-motion`: suena igual, pero en lugar de la animación hay un fundido de 200 ms.

Hay un prototipo de esta rotura en `referencias/placas/Main.dc.html` (clases `.torn`, keyframes `stubFall` y `bodyOpen`). En el código final tiene que quedar mejor que eso: el prototipo solo marca el ritmo.

## 3. Visor de fichas (navegación horizontal)

Referencias: `referencias/capturas/02-visor-fichas.jpg`, más `ref-visor-disney.png` y `ref-visor-emperagoat.png` (las mandó Uri). Así se pasa de proyecto en proyecto sin pantallas de carga y sin volver atrás.

- **Overlay** a pantalla completa:
  - El fondo es la home detrás, con blur de 12 px y oscurecida (`rgba(20,18,16,.6)`), teñida apenas con el color del proyecto activo.
  - Arriba a la derecha va un botón ✕ circular de 48 px.
- **Pista horizontal** con las 8 fichas una al lado de la otra:
  - La activa queda centrada: ancho `min(1180px, 100vw − 260px)`, radio 32 px, con 44 px de aire arriba. Se ve de corrido hasta abajo y se scrollea por dentro.
  - Las vecinas asoman por los costados, con escala 0.94, blur de 3 px, saturación 0.7 y opacidad 0.55. Tocar una vecina lleva a esa ficha.
  - El orden es circular: después de la 08 viene la 01, igual que "Próxima función".
- **Cómo se pasa de ficha:**
  - Trackpad o rueda horizontal (`deltaX`) y Shift + rueda.
  - Arrastre o swipe con el puntero, con inercia y snap. Usar GSAP Observer o Draggable.
  - Flechas ← → del teclado.
  - Píldora abajo al centro: botón ←, contador "04 / 08" en Courier y botón →.
  - El bloque "Próxima función" al final de cada ficha.
- **Bloqueo de eje:** si el gesto empieza en vertical (los primeros 8 px), scrollea la ficha; si empieza en horizontal, mueve la pista. Nunca las dos cosas a la vez.
- **Transición entre fichas:**
  - 750 ms, `cubic-bezier(.65,0,.2,1)`.
  - La ficha que sale se achica y se desenfoca hacia su lugar de vecina. La que entra hace lo contrario.
  - El tinte del fondo funde al color nuevo.
  - La ficha nueva arranca arriba de todo.
- **URL:**
  - Al abrir se hace `pushState` a `#/funcion/<slug>`.
  - Al pasar de ficha, `replaceState`, para que "Atrás" cierre el visor en lugar de recorrer fichas.
  - Entrar directo a una URL abre la home con el visor ya abierto en esa ficha, sin la animación de rotura.
- **Esc** cierra. Mientras el visor está abierto, el foco queda dentro del panel activo y el scroll del body se bloquea.
- **Rendimiento:**
  - Se renderiza la activa más una vecina de cada lado. Las demás se montan cuando hace falta.
  - Al salir de una ficha, su video se pausa.

### Contenido de cada ficha (panel)

Copiar la estructura de `referencias/placas/Ficha*.dc.html` y `capturas/1*-ficha-*.jpg`:

1. **Hero** (fondo `heroBg`, texto `#F4E9D6`):
   - Línea mono con "FUNCIÓN 0X", un filete y la `marca`.
   - Píldora de créditos con borde de 2 px, radio 40 y los dos `dupla.creditos`.
   - Título gigante (Archivo Narrow 700, ~210 px en desktop, interlineado 0.86, en `tituloLineas`).
   - "una idea para {para}" en Courier 22 px.
   - Marco de 1120×600 con radio 46 y borde de 3 px de tinta: foto en duotono sobre `#F2D3BF`, con las pegatinas s1–s4 que existan para ese proyecto.
   - Logline en Courier 700, 22 px, centrada.
2. **Pestañas** (anclas internas): VIDEOCASO, BOARD, GRÁFICAS o PIEZAS, ESTRELLAS. Solo las de las secciones que existen en ese proyecto.
3. **Videocaso** (si `video` existe):
   - Fondo `--sala` y título "Videocaso" en Advercase.
   - El **reproductor A** (ver abajo).
   - Debajo, una tira de fílmico con perforaciones arriba y abajo y las imágenes de `tira`.
4. **Board** (si existe): fondo `#E2D7C0`, título "Board" y la imagen en un marco `#F6F1E6` con borde de 3 px y sombra dura de 14 px.
5. **Piezas** (si existe): fondo de `piezas.fondo`, título "Las piezas" y la grilla de `piezas.layout`.
6. **Estrellas:**
   - A la izquierda, el promedio (`estrellas`) en estrellas grandes de 120 px.
   - A la derecha, "TU CALIFICACIÓN" con 5 estrellas tocables. La activa va en dorado y la vacía en `--gris`. Al tocar, rebotan en cascada.
   - Se guarda en `localStorage`. Sin textos de más.
7. **Próxima función:** entrada horizontal grande con muescas, del color del proyecto siguiente, y talón "VER →". Al tocarla se pasa a la ficha siguiente en horizontal: no se rompe ni recarga nada.

### Reproductor A (línea)

Referencia: `referencias/placas/Reproductor.dc.html`, variante `linea`, y `capturas/05-reproductor-A.jpg`.

- Video 16:9 sobre `#0A0908`, con un degradé de abajo hacia arriba (`rgba(10,9,8,.75)` hasta transparente al 30%).
- En pausa: un círculo crema `#EEE6D3` de 92 px en el centro, con el triángulo de play en tinta. Nada más.
- Abajo, a 36 px de los bordes:
  - una fila mono de 13 px con "FUNCIÓN 0X · TÍTULO" a la izquierda y "00:00 / dur" a la derecha;
  - una línea de progreso de 2 px (fondo `rgba(238,230,211,.35)`, avance del `color` del proyecto), que se puede arrastrar y es accesible como `role="slider"`.
- Al reproducir:
  - El círculo desaparece.
  - Si el mouse se queda quieto 2 s, la barra se esconde. Click en el video = pausa.
  - Doble click = pantalla completa.
  - La barra también se maneja con teclado (←/→ adelantan o atrasan 5 s).
- Usar `<video>` nativo con `playsinline`, `preload="none"` y el `poster` del archivo de datos.

## 4. Sacá tu entrada (contacto)

- Sección de fondo `--sala`.
- Una entrada grande:
  - **Cuerpo** papel, con "SACÁ TU ENTRADA" en Archivo Narrow 700 de 150 px.
  - Debajo, un filete de 2 px y dos columnas separadas por un troquel punteado, una para **Uri** y otra para **Guada**:
    - el nombre en Roycella de 96 px, del color `tinta` de cada uno;
    - tres filas mono: MAIL (`mailto:`), WHATSAPP (`wa.me`) y LINKEDIN (abre en una pestaña nueva, con ↗).
  - **Talón** rojo de 210 px con "Uri & Guada" en vertical (Roycella) y un código de barras.
- Al pasar por un dato, este se subraya con una línea que crece de izquierda a derecha.
- Al tocar el mail, además de abrir el cliente de correo, se copia al portapapeles y el talón hace un "sello" (una pequeña rotación y escala). No mostrar ningún texto de "copiado".

## 5. Tierlist

Referencia: `capturas/04-tierlist.jpg` y la sección final de `01-home.jpg`.

- "TIERLIST" en Archivo Narrow 700 de 190 px.
- A la derecha, dos botones: REINICIAR (con borde) y "DESCARGAR MI TIERLIST ↓" (negro, con muescas).
- 5 filas, de arriba hacia abajo: **Obra maestra · Cine · Está bien · Me dormí · Mucha merd**, con sus colores en `tiers`. Cada fila tiene una etiqueta de color de 190 px de ancho y un área oscura `#26221E`.
- Debajo, el pozo "EN CARTEL" (borde punteado de 3 px) con las 8 mini-entradas: 128×152, foto en duotono arriba y título abajo, separados por un troquel.
- Primera visita: todo en el pozo. Después se restaura lo que dejó el visitante.

### El arrastre: tiene que estar muy bien animado

Pointer Events (mouse y touch). Se puede usar GSAP Draggable o hacerlo a mano.

- **Agarrar** (en el pointerdown; en touch, con un long-press de 120 ms para no pelearse con el scroll):
  - La mini-entrada crece a 1.08 con un resorte, la sombra pasa de nada a `0 18px 30px rgba(0,0,0,.35)` y queda por encima de todo.
  - Su lugar se convierte en un hueco punteado del mismo tamaño.
  - El cursor pasa a `grabbing`.
- **Arrastrar:**
  - La entrada sigue al puntero con un leve retraso elástico (lerp de ~0.25 por frame).
  - Se inclina según la velocidad horizontal (±10°) y vuelve a 0° cuando se frena, como un papel en el aire.
  - La fila sobre la que pasa se ilumina (el área sube un 6% de brillo) y su etiqueta de color hace un pulso de escala 1.04.
  - Dentro de la fila, las otras entradas se corren con Flip para abrir lugar donde va a caer, y una línea dorada marca la posición.
- **Soltar en una fila:**
  - La entrada vuela a su lugar con resorte (`back.out(1.7)`, 450 ms).
  - Al tocar, hace un aplastón (`scaleY` 0.92 → 1) y la etiqueta de la fila rebota.
  - Si es la primera entrada de esa fila, aparece un sello dorado chico que se va enseguida.
- **Soltar fuera:** la entrada vuelve a su origen con resorte.
- **Alternativa táctil y de teclado:**
  - Tocar una entrada la selecciona (anillo dorado y se eleva 6 px); después, tocar una fila la coloca.
  - Teclado: Espacio para agarrar, flechas para elegir fila y posición, Espacio para soltar, Esc para cancelar.
- **REINICIAR:** todas las entradas vuelven volando al pozo, en cascada de 40 ms.
- **DESCARGAR MI TIERLIST:**
  - Genera un PNG de 1080×1350 (formato historia) con la tierlist, el grano y la firma "Uri & Guada" en Roycella. Usar `html-to-image` o dibujarlo en un canvas.
  - La descarga se llama `tierlist-uri-y-guada.png`. En mobile, `navigator.share` con el archivo si está disponible.
- Persistir en `localStorage`.

## 6. Footer

Fondo tinta. Solo "© URI & GUADA" en Courier 12 px, color `--gris`.

---

## Videos

Los videocasos originales están en la carpeta de arriba, `../` (el campo `video.origen` de cada proyecto). Pesan entre 60 y 200 MB y tres están en 4K: **no** se suben así.

Hay que comprimirlos a `public/video/<slug>.mp4` con 1080p, H.264 y `faststart`. Apuntar a menos de 25 MB cada uno:

```bash
ffmpeg -i "../1 - SPOTIFUCK.mp4" -vf "scale=-2:1080" -c:v libx264 -preset veryfast -crf 26 \
  -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k public/video/spotifuck.mp4
```

Si alguno pasa los 50 MB, subir el CRF a 28. Si aun así es pesado para Pages, proponer subirlos a Vimeo o YouTube (sin listar) y usar el mismo reproductor con su API. Kamasutra y Cód1gos no tienen video.

## Publicación

1. Crear el repo. Por defecto: organización `uriyguada` y repo `uriyguada.github.io`, para que la URL no lleve el usuario de nadie. **Preguntarle a Uri antes de crearlo.** Su usuario de GitHub es `uborits-gif`.
2. Workflow de Actions: build con Vite y deploy a Pages.
3. `vite.config.js`: `base: '/'` si es `<org>.github.io`; si no, `'/<repo>/'`.
4. `index.html` con `<title>Uri & Guada</title>`, descripción "Dupla creativa", Open Graph con una imagen de 1200×630 armada con el hero (generarla), favicon con el `&` rojo de Roycella sobre papel.
5. Probar el sitio publicado y pasar la URL.
