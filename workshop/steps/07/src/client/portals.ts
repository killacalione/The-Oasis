import { portal,type Location } from '../shared/worlds.js';
export class PortalEntry {
  private previous?:Location;private armed=false;
  reset(){this.previous=undefined;this.armed=false;}
  observe(position:Location,enabled=true){const previous=this.previous;this.previous={...position};const inside=Math.abs(position.x-portal.x)<=1.8&&Math.abs(position.z-portal.z)<=1.25;
    if(!previous||previous.worldId!==position.worldId){this.armed=!inside;return false;}
    if(!this.armed){if(!inside)this.armed=true;return false;}
    const cross=(previous.z<portal.z&&position.z>=portal.z)||(previous.z>portal.z&&position.z<=portal.z);if(!cross)return false;
    const t=(portal.z-previous.z)/(position.z-previous.z),x=previous.x+t*(position.x-previous.x);if(Math.abs(x-portal.x)>portal.halfWidth)return false;this.armed=false;return enabled;
  }
}
