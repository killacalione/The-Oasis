import { movement,step,spawn } from '../shared/worlds.js';
const output=document.querySelector('#player')!;
const position=step(spawn('hub'),movement(0,1,1),.05);
output.textContent=JSON.stringify({lesson:2,position,note:'A normalized diagonal moves the same distance as forward.'},null,2);
