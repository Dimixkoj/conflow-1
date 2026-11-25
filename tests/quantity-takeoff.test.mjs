import test from 'node:test';
import assert from 'node:assert/strict';
import { quantityLinesFor } from '../renderer/quantity-takeoff.mjs';

const line=(rows,code)=>rows.find(x=>x.measureCode===code);

test('wall takeoff deducts hosted doors and windows and creates finish lines',()=>{
 const wall={id:'w1',type:'wall',length:4,width:.15,height:3};
 const elements=[wall,{id:'d1',type:'door',hostId:'w1',length:.9,height:2.1},{id:'n1',type:'window',hostId:'w1',length:1.2,height:1.2}];
 const rows=quantityLinesFor(wall,elements);
 const net=12-.9*2.1-1.2*1.2;
 assert.ok(Math.abs(line(rows,'wall_area').qty-net)<1e-9);
 assert.ok(Math.abs(line(rows,'wall_plaster').qty-net*2)<1e-9);
 assert.equal(line(rows,'wall_blocks').unit,'No.');
});

test('slab takeoff includes concrete, soffit, floor finish and stated screed allowance',()=>{
 const rows=quantityLinesFor({type:'slab',length:5,width:4,height:.15});
 assert.equal(line(rows,'slab_concrete').qty,3);
 assert.equal(line(rows,'slab_formwork').qty,20);
 assert.equal(line(rows,'slab_screed').qty,1);
});

test('roof area uses pitch and flat roofs remain plan area',()=>{
 const pitched=quantityLinesFor({type:'roof',length:6,width:5,pitch:30,roofStyle:'gable'});
 const flat=quantityLinesFor({type:'roof',length:6,width:5,pitch:30,roofStyle:'flat'});
 assert.ok(line(pitched,'roof_cover').qty>30);
 assert.equal(line(flat,'roof_cover').qty,30);
});

test('beam and column takeoff includes concrete and formwork',()=>{
 const beam=quantityLinesFor({type:'beam',length:4,width:.25,height:.4});
 const column=quantityLinesFor({type:'column',length:.3,width:.3,height:3});
 assert.equal(line(beam,'beam_concrete').qty,.4);
 assert.ok(line(beam,'beam_form').qty>0);
 assert.ok(line(column,'column_form').qty>0);
});

test('pad footing takeoff exposes assumed excavation, blinding and formwork rules',()=>{
 const rows=quantityLinesFor({type:'foundation',length:1.5,width:1.5,height:.45});
 assert.ok(line(rows,'footing_excavation').qty>line(rows,'footing_concrete').qty);
 assert.ok(line(rows,'footing_blinding').qty>0);
 assert.ok(line(rows,'footing_form').qty>0);
});

test('landscape includes area and topsoil allowance',()=>{
 const rows=quantityLinesFor({type:'landscape',length:4,width:3});
 assert.equal(line(rows,'land_area').qty,12);
 assert.ok(Math.abs(line(rows,'land_topsoil').qty-1.8)<1e-9);
});
