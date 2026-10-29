import { createPlayer, changeColor } from './player.js';
let player = createPlayer('Explorer');
function render() { document.querySelector('#player').textContent = JSON.stringify(player,null,2); }
document.querySelector('#rename').addEventListener('click',()=>{player={...player,...createPlayer(document.querySelector('#name').value),color:player.color};render();});
document.querySelector('#color').addEventListener('click',()=>{player=changeColor(player);render();});
render();
