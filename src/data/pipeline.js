// Seed-to-shelf pipeline stages (copy for the molecule reactor).
const RX = [
  { t:'Ethical sourcing', a:'Seed', b:'Sun & water', p:'Botanical',
    d:'Botanicals come from partner farms and wild-harvest collectives. Every lot is logged, so it can be traced back to the field it grew in.', s:['Farm-traceable lots','Seasonal harvest'] },
  { t:'Gentle extraction', a:'Botanical', b:'CO₂ solvent', p:'Extract',
    d:'Low-temperature water and CO₂ extraction protect heat-sensitive plant compounds and essential oils.', s:['Low-heat process','Standardised extracts'] },
  { t:'Formulation', a:'Extract', b:'Carrier base', p:'Formula',
    d:'Our formulators set plant actives at measured doses, then shape them into the right format: a gummy, a roll-on oil, an inhaler or a liquid.', s:['Measured doses','Plant-based bases'] },
  { t:'Batch testing', a:'Formula', b:'Assay markers', p:'Verified blend',
    d:'Each batch is checked for active content, heavy metals and microbial safety before it moves on to the next stage.', s:['Actives assay','Heavy metals','Microbial'] },
  { t:'Stability & sensory', a:'Verified blend', b:'Antioxidant shield', p:'Stable formula',
    d:'Samples are aged and tasted so texture, scent and potency hold up until the last drop or gummy.', s:['Shelf-life study','Taste panel'] },
  { t:'Sealed & shipped', a:'Stable formula', b:'Batch-coded seal', p:'TranzLife product',
    d:'Every pack is sealed, batch-coded and boxed, with recycled kraft and biodegradable materials wherever we can, then shipped to your door or nearest store.', s:['Batch-coded','Recycled kraft sleeve'] }
];

const NSTAGE = RX.length;

export { RX, NSTAGE };
