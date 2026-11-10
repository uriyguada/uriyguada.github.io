// About de la dupla (variante B · "rollo revelado").
// Los textos van EXACTAMENTE así. No agregar ni corregir nada.
// Las fotos están en public/img/about/ ya pasadas a blanco y negro aclarado:
// en la web llevan el duotono del color de cada uno.
// La primera foto de cada uno es la del cine; las dos tienen el mismo encuadre a propósito.

export const about = [
  {
    id: 'uri',
    nombre: 'Uri',
    color: '#EBA5B3', // duotono y color del nombre
    tinta: '#7A1229',
    fotos: [
      { img: '/img/about/uri-cine.jpg',   alt: 'Uri de espaldas en la sala de cine',              pos: '50% 40%' },
      { img: '/img/about/uri-selfie.jpg', alt: 'Selfie de Uri con anteojos de sol',               pos: '50% 40%' },
      { img: '/img/about/uri-trofeo.jpg', alt: 'Uri con un trofeo',                               pos: '50% 30%' },
      { img: '/img/about/uri-charla.jpg', alt: 'Uri dando una charla en la Universidad de Palermo', pos: '35% 50%' },
      { img: '/img/about/uri-libro.jpg',  alt: 'Uri con un libro',                                pos: '62% 50%' },
    ],
    texto: [
      'Soy Uri, tengo 24 años y soy diseñador multimedial y director de arte. Hoy trabajo como freelance para agencias como Zurda, Dogs Dock, Not Agency y Encender, y fundé Uricó, un estudio creativo especializado en branding y motion.',
      'Mi historia con la creatividad empezó a los 12, cuando conocí a Lyna, una creadora de contenido infantil que en ese momento tenía 80.000 suscriptores en YouTube y hoy supera los 35 millones. Yo era su fan y ella terminó siendo fan de lo que yo hacía, así que durante seis años trabajé diseñando su marca, sus libros y su merchandising, además de crear contenido para su canal.',
      'A la par fui probando otras formas de contar historias. Tuve un canal de YouTube que llegó al millón de suscriptores y creé el videojuego de Lyna, que ya jugaron más de 30 millones de personas. También escribí el libro Secretos, una serie animada infantil y Boda Lyniel, una obra de teatro que se presentó en el Gran Rex y después salió de gira por otros países.',
      'Dicen que tengo muchas refes en la cabeza, y aunque no sé bien dónde las guardo, cuando hacen falta aparecen.',
      'Me formé en Brother, donde gané siete premios en el festival interno, y también me llevé un Oro en los Premios Obrar.',
      'La publicidad es lo que más me apasiona y tengo muchísimas ganas de seguir pensando muuchas ideas. Si tu agencia está buscando a alguien así, menos mal que leíste hasta el final.',
    ],
    estudios: [
      ['Técnico superior en Diseño Multimedial', 'ISEC'],
      ['Licenciado en Diseño Gráfico', 'Universidad de Palermo'],
      ['Creatividad integral', 'Brother Escuela de Creativos'],
    ],
  },
  {
    id: 'guada',
    nombre: 'Guada',
    color: '#8EC8D2',
    tinta: '#0F4C57',
    fotos: [
      { img: '/img/about/guada-cine.jpg',      alt: 'Guada de espaldas en la sala de cine',                       pos: '50% 40%' },
      { img: '/img/about/guada-retrato.jpg',   alt: 'Retrato de Guada',                                          pos: '58% 40%' },
      { img: '/img/about/guada-ballet.jpg',    alt: 'Guada bailando ballet en la barra',                         pos: '50% 55%' },
      { img: '/img/about/guada-taekwondo.jpg', alt: 'Diploma y trofeo del Campeonato Nacional de Taekwondo',     pos: '50% 45%' },
      { img: '/img/about/guada-libro.jpg',     alt: 'Guada en la presentación de su libro de poesía Fénix',      pos: '35% 50%' },
    ],
    texto: [
      'Soy Guada Alonso, escritora y tucumana, tengo 19 años y hace 4 que trabajo en publicidad (claramente de forma ilegal).',
      'Comencé en agencias de redes a los 16 siendo community, estratega, editora, diseñadora, redactora y básicamente me curtí teniendo 10 cuentas en instagram y llevando la compu para hacer las planificaciones a la secundaria.',
      'Soy cinturón negro en Taekwondo, bailarina de ballet y publiqué mi primer libro de poesía hace unos años.',
      'Cuando no estoy pensando en titulares pienso en ideas para futuras novelas o escenarios ficticios en mi cabeza.',
      'Toco la guitarra, me encanta la ropa, soy adicta al café y no conozco el concepto de dormir temprano.',
      'Fui parte del elenco estable de teatro de Tucumán durante 6 años, y uno de mis sueños es actuar en mi propio comercial. Fundé Agencia GAM donde realizo creatividad y estrategia en redes trabajando con clientes freelance.',
      'Gané el concurso de Publicis “Potenciando Creativas 2026” y trabajé en La Comunidad.',
      'No hay cosa que disfrute más que hacer publicidad y creo que es una de las razones por la cual me tenés que contratar :)',
    ],
    estudios: [
      ['Licenciatura en Publicidad', 'UADE · Actualidad'],
      ['Creatividad Integral', 'Brother Escuela de Creativos'],
    ],
  },
];
