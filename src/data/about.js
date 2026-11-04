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
      { img: '/img/about/uri-libro.jpg',  alt: 'Uri con un libro abierto',                        pos: '50% 55%' },
    ],
    texto: [
      'Soy Uri. Tengo 24 años, soy diseñador multimedial y director de arte.',
      'Mi gusto de helado favorito es la menta granizada. Defiendo que el pastel de papa tiene que ser papa-carne-papa y nunca carne-papa. Y que las medialunas de manteca son mejores que las de grasa.',
      'Dicen que tengo muchas refes en la cabeza. No sé dónde las guardo pero cuando hacen falta, aparecen.',
      'Soy jugador profesional de burako y me gusta armar rompecabezas.',
      'Me gusta hacer cosas que imagino y crear narrativas. Saco fotos con una cámara analógica.',
      'Dejo pasar meses antes de revelar el rollo y cuando por fin lo hago, mi momento favorito es cuando veo fotos que había olvidado que saqué. Me gusta no saber.',
      'Trabajé freelance para agencias como Not Agency, Dogs Dock y Zurda Agency, en proyectos de branding, redes, key visuals, edición y videocasos.',
      'Me gusta comprar libros que después no llego a leer.',
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
      'Soy Guada Alonso, soy Tucumana, tengo 19 años y hace 4 que trabajo en publicidad (claramente de forma ilegal).',
      'Comencé en agencias de redes a los 16 siendo community, estratega, editora, diseñadora, redactora y básicamente me curtí teniendo 10 cuentas en instagram y llevando la compu para hacer las planificaciones a la secundaria.',
      'Soy cinturón negro en Taekwondo, bailarina de ballet y publiqué mi primer libro de poesía hace unos años.',
      'Cuando no estoy pensando en titulares pienso en ideas para futuras novelas o escenarios ficticios en mi cabeza.',
      'Toco la guitarra, me encanta la ropa, soy adicta al café y no conozco el concepto de dormir temprano.',
      'Fui parte del elenco estable de teatro de Tucumán durante 6 años, y uno de mis sueños es actuar en mi propio comercial.',
      'Gané el concurso de Publicis “Potenciando Creativas 2026” y trabajé en La Comunidad.',
      'No hay cosa que disfrute más que hacer publicidad y creo que es una de las razones por la cual me tenés que contratar :)',
    ],
    estudios: [
      ['Licenciatura en Publicidad', 'UADE · Actualidad'],
      ['Creatividad Integral', 'Brother Escuela de Creativos'],
    ],
  },
];
