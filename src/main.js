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
import { prepararSonido, sonar } from './lib/sonido.js';

const visor = montarVisor();

montarHero(document.getElementById('hero'));
montarCartelera(document.getElementById('cartelera'), {
  alAbrir: (slug) => visor.abrir(slug),
});
montarContacto(document.getElementById('entrada'));
montarTierlist(document.getElementById('tierlist'));
prepararSonido();

// Todo lo que se toca hace click. Abrir, cerrar y pasar de proyecto tienen su propio sonido.
document.addEventListener('click', (e) => {
  const el = e.target.closest('button, a');
  if (!el || el.matches('.entrada, .visor__cerrar, [data-ir-ficha]')) return;
  sonar('click', { volumen: 0.6 });
});
