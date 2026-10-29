import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3,Color4 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { WORLDS,portal,type WorldId } from '../shared/worlds.js';
import type { VisiblePlayer } from '../shared/contracts.js';
export class WorldView {
  private engine:Engine;private scene!:Scene;private camera!:FreeCamera;private world:WorldId='hub';
  private avatars=new Map<string,{root:TransformNode;color:string}>();private players:VisiblePlayer[]=[];private own='local';
  yaw=0;pitch=Math.atan2(5.5,10);onFrame?:(dt:number)=>void;
  constructor(private canvas:HTMLCanvasElement){this.engine=new Engine(canvas,true);this.load('hub');new ResizeObserver(()=>this.engine.resize()).observe(canvas);this.engine.runRenderLoop(()=>{const dt=Math.min(this.engine.getDeltaTime()/1000,.1);this.onFrame?.(dt);this.draw(dt);this.scene.render();});}
  private material(color:string){const m=new StandardMaterial('surface',this.scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=Color3.Black();return m;}
  load(world:WorldId){this.scene?.dispose();this.avatars.clear();this.world=world;this.scene=new Scene(this.engine);const w=WORLDS[world];this.scene.clearColor=Color4.FromHexString(w.sky+'ff');this.camera=new FreeCamera('camera',new Vector3(0,7,14),this.scene);this.camera.minZ=.1;this.camera.maxZ=150;new HemisphericLight('sky',new Vector3(.3,1,.2),this.scene);
    const ground=MeshBuilder.CreateCylinder('ground',{diameter:25,height:.4,tessellation:32},this.scene);ground.position.y=-.2;ground.material=this.material(w.ground);
    if(world==='hub'){const beacon=MeshBuilder.CreatePolyhedron('beacon',{type:1,size:1},this.scene);beacon.position.set(-4,2,-1);beacon.material=this.material(w.accent);}
    else for(let i=0;i<5;i++){const tree=MeshBuilder.CreateCylinder('tree',{height:3,diameterBottom:2,diameterTop:0,tessellation:5},this.scene);tree.position.set(-8+i*4,1.5,-9);tree.material=this.material('#366d56');}
    for(const x of [-1.6,1.6]){const leg=MeshBuilder.CreateBox('portal-pillar',{width:.25,height:4,depth:.3},this.scene);leg.position.set(x,2,portal.z);leg.material=this.material(w.accent);}
    const top=MeshBuilder.CreateBox('portal-top',{width:3.5,height:.25,depth:.3},this.scene);top.position.set(0,4,portal.z);top.material=this.material(w.accent);
    const veil=MeshBuilder.CreatePlane('portal-opening',{width:2.9,height:3.8},this.scene);veil.position.set(0,1.9,portal.z);const mat=this.material(w.accent);mat.alpha=.3;mat.backFaceCulling=false;veil.material=mat;
  }
  update(players:VisiblePlayer[],own:string){this.players=players;this.own=own;const player=players.find(p=>p.session===own);if(player&&player.worldId!==this.world)this.load(player.worldId);}
  look(dx:number,dy:number){this.yaw=Math.atan2(Math.sin(this.yaw+dx),Math.cos(this.yaw+dx));this.pitch=Math.max(-4*Math.PI/180,Math.min(80*Math.PI/180,this.pitch+dy));}
  private draw(dt:number){const visible=this.players.filter(p=>p.worldId===this.world);for(const [id,a]of this.avatars)if(!visible.some(p=>p.session===id)){a.root.dispose(false,true);this.avatars.delete(id);}
    for(const p of visible){let avatar=this.avatars.get(p.session);if(avatar&&avatar.color!==p.color){avatar.root.dispose(false,true);this.avatars.delete(p.session);avatar=undefined;}if(!avatar){const root=new TransformNode('avatar',this.scene);const body=MeshBuilder.CreateCapsule('body',{height:1.4,radius:.3,tessellation:8},this.scene);body.position.y=.8;body.material=this.material(p.color);body.parent=root;const head=MeshBuilder.CreateSphere('head',{diameter:.5,segments:6},this.scene);head.position.y=1.7;head.material=this.material('#e8ded0');head.parent=root;root.position.set(p.x,p.y,p.z);avatar={root,color:p.color};this.avatars.set(p.session,avatar);}const amount=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,dt*14);avatar.root.position=Vector3.Lerp(avatar.root.position,new Vector3(p.x,p.y,p.z),amount);avatar.root.rotation.y=p.facing;
      if(p.session===this.own){const target=avatar.root.position.add(new Vector3(0,1.3,0)),radius=Math.hypot(10,5.5),horizontal=radius*Math.cos(this.pitch);this.camera.position.set(target.x+Math.sin(this.yaw)*horizontal,target.y+Math.sin(this.pitch)*radius,target.z+Math.cos(this.yaw)*horizontal);this.camera.setTarget(target);}}
  }
  metrics(){return{world:this.world,yaw:this.yaw,pitch:this.pitch,position:this.players.find(p=>p.session===this.own),cameraRight:this.camera.getDirection(Vector3.Right()).asArray(),scenes:this.engine.scenes.length,meshes:this.scene.meshes.length,fps:this.engine.getFps()};}
}
