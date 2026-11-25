import test from 'node:test';
import assert from 'node:assert/strict';
import { tradeForItem, rateBuildUp, itemAmount, tradeSummary, dimensionSheet } from '../renderer/estimating-engine.mjs';

test('CAD measurement codes map into trade sections',()=>{
 assert.equal(tradeForItem({measureCode:'footing_concrete'}),'B');
 assert.equal(tradeForItem({measureCode:'wall_blocks'}),'C');
 assert.equal(tradeForItem({measureCode:'roof_cover'}),'D');
 assert.equal(tradeForItem({measureCode:'wall_paint'}),'E');
 assert.equal(tradeForItem({measureCode:'electrical_count'}),'F');
 assert.equal(tradeForItem({measureCode:'plumbing_count'}),'G');
 assert.equal(tradeForItem({measureCode:'land_area'}),'J');
});
test('rate build-up applies waste to materials only, then overhead and profit',()=>{
 const x=rateBuildUp({labourCost:100,materialCost:200,plantCost:50,waste:10,overheadPct:10,profitPct:5});
 assert.equal(x.wasteMaterial,20); assert.equal(x.overhead,37); assert.equal(x.profit,20.35); assert.equal(x.rate,427.35);
});
test('PC and PS sums are separated from measured rates',()=>{
 assert.equal(itemAmount({itemType:'PC',provisionalAmount:50000,quantity:1}),50000);
 assert.equal(itemAmount({itemType:'PS',provisionalAmount:25000}),25000);
});
test('trade summary returns section totals and grand total reconciles',()=>{
 const items=[{measureCode:'wall_blocks',quantity:10,rateOverride:20},{measureCode:'roof_cover',quantity:5,rateOverride:30},{itemType:'PC',provisionalAmount:100}];
 const sections=tradeSummary(items);
 assert.equal(sections.find(x=>x.code==='C').total,200);
 assert.equal(sections.find(x=>x.code==='D').total,150);
 assert.equal(sections.find(x=>x.code==='Z').total,100);
 assert.equal(sections.reduce((s,x)=>s+x.total,0),450);
});
test('dimension sheet records drawing reference, dimensions and verification state',()=>{
 const d=dimensionSheet({sourceId:'wall-1',drawingReference:'A-101',measurementBasis:'L × H',quantity:12,unit:'m²'},{type:'wall',length:4,height:3});
 assert.equal(d.drawingReference,'A-101'); assert.equal(d.dimensions.length,4); assert.equal(d.verification,'Pending QS verification');
});
