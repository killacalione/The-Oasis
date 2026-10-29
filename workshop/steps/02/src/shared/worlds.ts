export type WorldId = 'hub' | 'island';
export type Location = { worldId: WorldId; worldVersion: string; frame: string; x: number; y: number; z: number; facing: number };
export const COLORS = ['#65dcc0','#b5a2ff','#f5bd69'] as const;
export const WORLDS = {
  hub: { name:'Workshop Hub',ground:'#355563',sky:'#172e43',accent:'#65dcc0',target:'island' as WorldId },
  island: { name:'Workshop Island',ground:'#b5a880',sky:'#83b6c8',accent:'#f5bd69',target:'hub' as WorldId }
};
export const portal = { x:0,z:-6,halfWidth:1.45 };
export const isWorld = (value:unknown):value is WorldId => value==='hub'||value==='island';
export const spawn = (worldId:WorldId):Location => ({worldId,worldVersion:'1.0.0',frame:'oasis-y-up-metres-v1',x:0,y:0,z:4,facing:0});
export function validLocation(value:unknown):value is Location {
  if(!value||typeof value!=='object')return false;const p=value as Location;
  return isWorld(p.worldId)&&p.worldVersion==='1.0.0'&&p.frame==='oasis-y-up-metres-v1'&&[p.x,p.y,p.z,p.facing].every(Number.isFinite)&&p.y===0&&Math.hypot(p.x,p.z)<=12+1e-8&&Math.abs(p.facing)<=Math.PI;
}
export function movement(yaw:number,forward:number,right:number){const dx=-Math.sin(yaw)*forward-Math.cos(yaw)*right,dz=-Math.cos(yaw)*forward+Math.sin(yaw)*right;const length=Math.max(1,Math.hypot(dx,dz));return{dx:dx/length,dz:dz/length,facing:Math.atan2(Math.sin(yaw),Math.cos(yaw))};}
export function step(position:Location,input:{dx:number;dz:number;facing:number},dt:number):Location {
  const seconds=Math.min(.1,Math.max(0,dt)),length=Math.max(1,Math.hypot(input.dx,input.dz));let x=position.x+input.dx/length*5*seconds,z=position.z+input.dz/length*5*seconds;const radius=Math.hypot(x,z);if(radius>12){x*=12/radius;z*=12/radius;}return{...position,x,z,facing:input.facing};
}
