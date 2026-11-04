// R&D lab board rows.
import { LAB } from '../../data/lab.js';
import { $ } from '../../utils/dom.js';

function buildLab(){
  $('#board').insertAdjacentHTML('beforeend', LAB.map(l => `
    <div class="b-row">
      <div class="b-name"><b>${l.n}</b><small>${l.d}</small></div>
      <div class="b-bar${l.live ? ' live' : ''}" role="img" aria-label="${l.n}: ${l.st}, ${l.p}% through the pipeline"><i style="--p:${l.p}%" data-stage="${l.st}"></i></div>
      <div class="b-eta"><b>${l.eta}</b>${l.live ? 'In stores' : 'Target'}</div>
    </div>`).join(''));
}

export { buildLab };
