import './styles/base.css';
import './styles/hero.css';
import './styles/cartelera.css';
import './styles/contacto.css';
import './styles/tierlist.css';
import './styles/visor.css';
import './styles/ficha.css';
import './styles/lupa.css';

import { montarHero } from './componentes/hero.js';
import { montarCartelera } from './componentes/cartelera.js';
import { montarContacto } from './componentes/contacto.js';
import { montarTierlist } from './componentes/tierlist.js';
import { montarVisor } from './componentes/visor.js';
import { prepararSonido } from './lib/sonido.js';

let cartelera = null;

const visor = montarVisor({
  alCerrar: (slug) => cartelera && cartelera.recomponer(slug),
});

montarHero(document.getElementById('hero'));
cartelera = montarCartelera(document.getElementById('cartelera'), {
  alAbrir: (slug, origen) => visor.abrir(slug, origen),
});
montarContacto(document.getElementById('entrada'));
montarTierlist(document.getElementById('tierlist'));
prepararSonido();
