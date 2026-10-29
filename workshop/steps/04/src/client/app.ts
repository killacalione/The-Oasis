import { WorldView } from './view.js';import { inputs } from './input.js';import { spawn,step,WORLDS } from '../shared/worlds.js';
let player={...spawn('hub'),session:'local',name:'Explorer',color:'#65dcc0'};
const view=new WorldView(document.querySelector<HTMLCanvasElement>('#world')!),input=inputs(view,document.querySelector<HTMLCanvasElement>('#world')!);
view.onFrame=dt=>{player={...player,...step(player,input.read(dt),dt)};view.update([player],'local');document.querySelector('#world-name')!.textContent=WORLDS[player.worldId].name;document.querySelector('#position')!.textContent=JSON.stringify(player,null,2);};
document.querySelector('#lesson')!.textContent='Lesson 04 · local movement, orbit camera and two procedural worlds.';
document.querySelector('#travel')!.addEventListener('click',()=>{input.clear();player={...player,...spawn(WORLDS[player.worldId].target)};});
