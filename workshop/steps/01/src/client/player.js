export function createPlayer(name) { return { name: name.trim() || 'Explorer', color: '#65dcc0' }; }
export function changeColor(player) { return { ...player, color: player.color === '#65dcc0' ? '#b5a2ff' : '#65dcc0' }; }
