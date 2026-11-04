// Product catalogue: the five TranzLife products from the client's design boards.
// Prices are placeholders until the client confirms them.
const PRODUCTS = [
  { id:'gummies', no:'01', short:'Gummies', name:'TranzLife Gummies', cat:'gummies', tag:'Daily', price:549, size:'60 gummies',
    desc:'Plant-based gummies with natural flavours and colours, made to support immunity, energy and everyday wellbeing. Packed in a biodegradable jar with a plant-fibre eco cap.',
    ing:['Plant-based','Natural flavours & colours','60 gummies'], model:'jar', fit:1, gummy:['#d2161f', '#ee7a12', '#f2a12c', '#97182c', '#e8551a'] },
  { id:'inhaler', no:'02', short:'Calm Inhaler', name:'Calm Inhaler', cat:'inhaler', tag:'Calm', price:249, size:'Premium nasal inhaler',
    desc:'A premium nasal inhaler made with 100% natural, organic ingredients. Slip it into a pocket and take two slow breaths whenever you need a calm moment.',
    ing:['100% natural','Organic ingredients','Pocket size'], model:'inhaler', fit:1.16 },
  { id:'rollon', no:'03', short:'Calm Roll-On', name:'Calm Period Relief Roll-On', cat:'rollon', tag:'Relief', price:349, size:'Roll-on with gift box',
    desc:'A period cramp relief roll-on with rosemary, rose and peppermint, in a pocket-size bottle with its own gift box.',
    ing:['Rosemary','Rose','Peppermint'], model:'rollon', fit:1.06 },
  { id:'reviva', no:'04', short:'Reviva', name:'Reviva Roll-On', cat:'rollon', tag:'Foot care', price:449, size:'Roll-on',
    desc:'Diabetic foot care in a roll-on: soothing, plant-based and skin-friendly care for dry, tired feet, every day.',
    ing:['Plant-based','Skin friendly','Everyday care'], model:'reviva', fit:1.06 },
  { id:'liver', no:'05', short:'Liver Booster', name:'Liver Booster Liquid', cat:'liquid', tag:'Liver care', price:649, size:'100 ml',
    desc:'A plant-based liquid that supports healthy liver function and detoxification.* Liver care, naturally.',
    ing:['Plant-based formula','Detox support*','Overall wellness*'], model:'liver', fit:1.14 }
];

export { PRODUCTS };
