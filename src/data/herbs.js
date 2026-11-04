// Botanicals shown in the Science section. `p` is the index of the product the botanical is named on,
// or null for botanicals in our R&D library (not yet tied to a product on sale).
const HERBS = [
  { n:'Peppermint', latin:'Mentha × piperita', part:'Leaf oil', cmp:'Menthol', p:2, color:0x6fb07a, seed:23, txt:'Peppermint oil is rich in menthol, the compound behind its cool, fresh feel on the skin. It is one of the three botanicals in the Calm Roll-On.' },
  { n:'Rosemary', latin:'Salvia rosmarinus', part:'Leaf oil', cmp:'1,8-Cineole', p:2, color:0x7b9a5a, seed:29, txt:'A woody Mediterranean herb whose leaf oil is led by 1,8-cineole and camphor. Rosemary joins rose and peppermint in the Calm Roll-On.' },
  { n:'Rose', latin:'Rosa damascena', part:'Petal oil', cmp:'Geraniol', p:2, color:0xd88a96, seed:31, txt:'Damask rose petals give a soft floral oil, with geraniol and citronellol among its main compounds. Rose is named on the Calm Roll-On box.' },
  { n:'Tulsi', latin:'Ocimum tenuiflorum', part:'Leaf', cmp:'Eugenol', p:null, color:0x7cae45, seed:3, txt:'Holy basil grows in courtyards across India. Its leaves are rich in eugenol and have a long Ayurvedic history as a respiratory herb and everyday adaptogen.' },
  { n:'Eucalyptus', latin:'Eucalyptus globulus', part:'Leaf oil', cmp:'1,8-Cineole', p:null, color:0x6fb7a0, seed:11, txt:'Steam-distilled leaf oil whose main compound, 1,8-cineole, gives eucalyptus its cool, opening vapour.' },
  { n:'Ashwagandha', latin:'Withania somnifera', part:'Root', cmp:'Withanolides', p:null, color:0xd8a25a, seed:5, txt:'An adaptogenic root used for centuries to help the body cope with stress. Its active group of compounds is called withanolides.' },
  { n:'Amla', latin:'Phyllanthus emblica', part:'Fruit', cmp:'Ascorbic acid', p:null, color:0x9cc13f, seed:2, txt:'Indian gooseberry, one of the richest natural sources of vitamin C, and a base of the classic Chyawanprash.' },
  { n:'Chamomile', latin:'Matricaria chamomilla', part:'Flower', cmp:'Apigenin', p:null, color:0xe9cf6a, seed:17, txt:'Small daisy-like flowers best known as a bedtime tea. Apigenin is the flavonoid most studied for its calming effect.' },
];

export { HERBS };
