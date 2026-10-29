import test from 'node:test';import assert from 'node:assert/strict';
import { createPlayer,changeColor } from '../src/client/player.js';
test('events model keeps original data until explicitly replaced',()=>{const original=createPlayer(' Aster ');const next=changeColor(original);assert.equal(original.name,'Aster');assert.equal(original.color,'#65dcc0');assert.notEqual(next.color,original.color);assert.equal(createPlayer(' ').name,'Explorer');});
