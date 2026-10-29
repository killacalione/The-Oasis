import test from 'node:test';import assert from 'node:assert/strict';
import { spawn,step,movement,validLocation } from '../src/shared/worlds.js';
test('diagonals, elapsed-time bounds and platform bounds',()=>{const p=spawn('hub');const diagonal=step(p,movement(0,1,1),.05);assert.ok(Math.abs(Math.hypot(diagonal.x-p.x,diagonal.z-p.z)-.25)<1e-8);let q=p;for(let i=0;i<1000;i++)q=step(q,{dx:1,dz:1,facing:0},10);assert.ok(validLocation(q));assert.ok(Math.hypot(q.x,q.z)<=12+1e-8);assert.equal(validLocation({...p,x:Infinity}),false);});
