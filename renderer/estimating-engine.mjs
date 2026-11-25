export const MEASUREMENT_PROFILES = {
  NRM2: { label: 'NRM2 · RICS New Rules of Measurement 2', note: 'NRM2-oriented work-section structure. Verify item coverage, rules, descriptions and deductions against the licensed current NRM2 publication and project preliminaries.' },
  POMI: { label: 'POMI · Principles of Measurement (International)', note: 'POMI-oriented trade structure. Verify descriptions, units, deductions and coverage against the adopted POMI edition and project measurement preambles.' }
};

export const TRADES = [
  { code:'A', name:'Preliminaries', page:'Preliminaries' },
  { code:'B', name:'Substructure', page:'Substructure' },
  { code:'C', name:'Superstructure', page:'Superstructure' },
  { code:'D', name:'Roofing', page:'Roofing' },
  { code:'E', name:'Finishes', page:'Finishes' },
  { code:'F', name:'Electrical installations', page:'Electrical installations' },
  { code:'G', name:'Plumbing installations', page:'Plumbing installations' },
  { code:'H', name:'Mechanical installations', page:'Mechanical installations' },
  { code:'J', name:'External works', page:'External works' },
  { code:'Z', name:'Provisional / prime cost sums', page:'Provisional / prime cost sums' },
  { code:'M', name:'Furniture and equipment', page:'Furniture and equipment' },
  { code:'X', name:'Unclassified / QS review', page:'Unclassified / QS review' }
];

const TRADE_BY_MEASURE = {
  footing_concrete:'B', footing_excavation:'B', footing_blinding:'B', footing_form:'B',
  wall_area:'C', wall_blocks:'C', wall_volume:'C', column_concrete:'C', column_form:'C', beam_concrete:'C', beam_form:'C', slab_concrete:'C', slab_formwork:'C', slab_edge:'C',
  roof_cover:'D', roof_membrane:'D',
  wall_plaster:'E', wall_paint:'E', slab_finish:'E', slab_screed:'E',
  electrical_count:'F', plumbing_count:'G', mechanical_count:'H',
  land_area:'J', land_topsoil:'J',
  bed_count:'M', sofa_count:'M', table_count:'M', wardrobe_count:'M', cabinet_count:'M', furniture_count:'M', wall_volume:'C', stair_count:'C', door_count:'C', window_count:'C'
};
export function tradeForItem(item) {
  if (item.itemType === 'PC' || item.itemType === 'PS') return 'Z';
  if (item.tradeCode && TRADES.some(t=>t.code===item.tradeCode)) return item.tradeCode;
  if (item.measureCode && TRADE_BY_MEASURE[item.measureCode]) return TRADE_BY_MEASURE[item.measureCode];
  if (item.source === 'manual') return 'X';
  return 'X';
}
export function rateBuildUp(item={}) {
  const labour=Math.max(0,Number(item.labourCost ?? 0)||0);
  const material=Math.max(0,Number(item.materialCost ?? 0)||0);
  const plant=Math.max(0,Number(item.plantCost ?? 0)||0);
  const waste=Math.max(0,Number(item.waste)||0)/100;
  const direct=labour+material*(1+waste)+plant;
  const overhead=direct*Math.max(0,Number(item.overheadPct)||0)/100;
  const profit=(direct+overhead)*Math.max(0,Number(item.profitPct)||0)/100;
  return { labour, material, plant, wasteMaterial:material*waste, overhead, profit, rate:direct+overhead+profit };
}
export function itemAmount(item={}) {
  if (item.itemType==='PC' || item.itemType==='PS') return Math.max(0,Number(item.provisionalAmount ?? item.rate)||0);
  const built=rateBuildUp(item);
  const rate=Number(item.rateOverride ?? item.rate);
  const unitRate=item.rateOverride!=null?Math.max(0,rate||0):built.rate;
  return Math.max(0,Number(item.quantity)||0)*unitRate;
}
export function tradeSummary(items=[]) {
  return TRADES.map(t=>({...t,items:items.filter(i=>tradeForItem(i)===t.code),total:items.filter(i=>tradeForItem(i)===t.code).reduce((s,i)=>s+itemAmount(i),0)}));
}
export function dimensionSheet(item, element) {
  const e=element||{};
  return {
    sourceId:item.sourceId||null, drawingReference:item.drawingReference||'UNASSIGNED',
    modelObject:e.label||e.type||'Manual item',
    dimensions:{length:Number(e.length)||0,width:Number(e.width)||0,height:Number(e.height)||0,level:e.level||'Not assigned'},
    basis:item.measurementBasis||'Manual measurement — dimension sheet required',
    quantity:Number(item.quantity)||0, unit:item.unit||'Item',
    verification:item.verificationStatus||'Pending QS verification'
  };
}
