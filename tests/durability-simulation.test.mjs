import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateServiceLife} from '../renderer/durability-simulation.mjs';
test('service-life screen is bounded to 10-20 years',()=>{const x=simulateServiceLife([{id:'a',type:'column',material:'Concrete'}],{years:30});assert.equal(x.years,20);assert.equal(x.rows.length,1)});
test('coastal exposure and poor maintenance increase screening index',()=>{const e=[{id:'a',type:'roof',material:'Steel',properties:{condition:2}}];const a=simulateServiceLife(e,{exposure:'sheltered',maintenance:90});const b=simulateServiceLife(e,{exposure:'coastal',maintenance:10});assert.ok(b.rows[0].annualIndex>a.rows[0].annualIndex)});
test('empty models produce empty summary and explicit disclaimer',()=>{const x=simulateServiceLife([]);assert.equal(x.summary.elements,0);assert.match(x.notice,/not a structural calculation/i)});
