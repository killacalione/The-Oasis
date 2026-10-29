import { WorldView } from './view.js';import { spawn } from '../shared/worlds.js';
const view=new WorldView(document.querySelector<HTMLCanvasElement>('#world')!);
view.update([{...spawn('hub'),session:'local',name:'Explorer',color:'#65dcc0'}],'local');
document.querySelector('#lesson')!.textContent='Lesson 03 · one engine, scene, camera, light and avatar. Controls arrive in lesson04.';
for(const button of document.querySelectorAll<HTMLButtonElement>('button'))button.disabled=true;
