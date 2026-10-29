import { WorldView } from './view.js';import { inputs } from './input.js';import { spawn,step,WORLDS } from '../shared/worlds.js';import { arrival,feedback } from './profiles.js';
let player={...spawn('hub'),session:'local',name:'Explorer',color:'#65dcc0'},entered=false;
const canvas=document.querySelector<HTMLCanvasElement>('#world')!,view=new WorldView(canvas),input=inputs(view,canvas);
view.onFrame=dt=>{player={...player,...step(player,input.read(dt,entered),dt)};view.update([player],'local');document.querySelector('#world-name')!.textContent=WORLDS[player.worldId].name;document.querySelector('#position')!.textContent=JSON.stringify(player,null,2);};
document.querySelector('#lesson')!.textContent='Lesson05 · SQLite remembers your profile. Movement remains local; confirmed movement saves arrive in07.';
document.querySelector('#travel')!.addEventListener('click',()=>{if(entered){input.clear();player={...player,...spawn(WORLDS[player.worldId].target)};}});
arrival(profile=>{player={...profile.location,session:'local',name:profile.name,color:profile.color};entered=true;document.querySelector('#connection')!.textContent='Profile loaded · local movement';feedback('Your profile exists in SQLite. Movement here is still local.');});
