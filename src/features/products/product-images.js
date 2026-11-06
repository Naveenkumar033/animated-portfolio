// The client's product imagery: a square product shot, a cut-out and the full design board for each product.
import gummies from '../../assets/products/gummies.webp';
import gummiesDesign from '../../assets/products/gummies-design.webp';
import inhaler from '../../assets/products/inhaler.webp';
import inhalerDesign from '../../assets/products/inhaler-design.webp';
import rollon from '../../assets/products/rollon.webp';
import rollonDesign from '../../assets/products/rollon-design.webp';
import reviva from '../../assets/products/reviva.webp';
import revivaDesign from '../../assets/products/reviva-design.webp';
import liver from '../../assets/products/liver.webp';
import liverDesign from '../../assets/products/liver-design.webp';

import gummiesCut from '../../assets/products/gummies-cut.webp';
import inhalerCut from '../../assets/products/inhaler-cut.webp';
import rollonCut from '../../assets/products/rollon-cut.webp';
import revivaCut from '../../assets/products/reviva-cut.webp';
import liverCut from '../../assets/products/liver-cut.webp';

const SHOTS = { gummies, inhaler, rollon, reviva, liver };
// the same products cut out of their designs (transparent), for the hero and the product story
const CUTS = { gummies:gummiesCut, inhaler:inhalerCut, rollon:rollonCut, reviva:revivaCut, liver:liverCut };
const DESIGNS = { gummies:gummiesDesign, inhaler:inhalerDesign, rollon:rollonDesign, reviva:revivaDesign, liver:liverDesign };

export { SHOTS, CUTS, DESIGNS };
