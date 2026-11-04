// Giant scrolling marquee under the hero.
import { $ } from '../../utils/dom.js';

function buildMarquee(){
  const one = '<span>Live naturally</span><span>Live healthier</span>';
  $('#mq').innerHTML = one.repeat(4);
}

export { buildMarquee };
