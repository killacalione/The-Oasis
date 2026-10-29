import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { WORLDS, type WorldId } from '../shared/worlds.js';
import type { VisiblePlayer } from '../shared/contracts.js';
import { DEFAULT_PITCH, ORBIT_RADIUS, clampPitch, wrapYaw } from './navigation.js';
export type { VisiblePlayer } from '../shared/contracts.js';

export class WorldView {
  private engine: Engine;
  private scene!: Scene;
  private camera!: FreeCamera;
  private world: WorldId = 'hub';
  private avatars = new Map<string, { root: TransformNode; color: string }>();
  private players: VisiblePlayer[] = [];
  private own = '';
  yaw = 0;
  pitch = DEFAULT_PITCH;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  private turn = 0;
  private tilt = 0;
  onFrame?: (dt: number) => void;
  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, powerPreference: 'high-performance' });
    this.engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / 1.5));
    this.load('hub');
    this.engine.runRenderLoop(() => {
      const dt = Math.min(this.engine.getDeltaTime() / 1000, 0.1);
      this.onFrame?.(dt);
      this.yaw = wrapYaw(this.yaw + this.turn * dt * 1.6);
      this.pitch = clampPitch(this.pitch + this.tilt * dt * 1.2);
      this.renderPlayers(dt); this.scene.render();
    });
    window.addEventListener('resize', () => this.engine.resize());
    new ResizeObserver(() => this.engine.resize()).observe(canvas);
  }
  private material(name: string, color: string, glow = false) {
    const mat = new StandardMaterial(name, this.scene);
    mat.diffuseColor = Color3.FromHexString(color); mat.specularColor = new Color3(0.12, 0.15, 0.18);
    if (glow) mat.emissiveColor = Color3.FromHexString(color).scale(0.65);
    return mat;
  }
  load(id: WorldId) {
    this.scene?.dispose(); this.avatars.clear(); this.world = id;
    const w = WORLDS[id];
    this.scene = new Scene(this.engine); this.scene.clearColor = Color4.FromHexString(w.sky + 'ff');
    this.scene.fogMode = Scene.FOGMODE_EXP2; this.scene.fogDensity = id === 'island' ? 0.009 : 0.014; this.scene.fogColor = Color3.FromHexString(w.sky);
    this.camera = new FreeCamera('view', new Vector3(0, 15, 29), this.scene); this.camera.setTarget(new Vector3(0, 1, -2)); this.camera.minZ = 0.1; this.camera.maxZ = 300;
    const light = new HemisphericLight('sky', new Vector3(0.3, 1, -0.3), this.scene); light.intensity = id === 'observatory' ? 0.95 : 1.3; light.groundColor = new Color3(0.18, 0.22, 0.27);
    const base = this.material('ground', w.ground); const pale = this.material('stone', id === 'island' ? '#dfd4ad' : '#79929b'); const edge = this.material('edge', w.accent, true);
    const ground = MeshBuilder.CreateCylinder('platform', { diameter: w.bounds * 2 + 5, height: 1.1, tessellation: id === 'island' ? 18 : 64 }, this.scene); ground.position.y = -0.58; ground.material = base;
    const ring = MeshBuilder.CreateTorus('rim', { diameter: w.bounds * 2 + 2, thickness: 0.12, tessellation: 72 }, this.scene); ring.position.y = 0.05; ring.material = edge;
    if (id === 'hub') {
      for (let i = -3; i <= 3; i++) {
        const path = MeshBuilder.CreateBox(`walkway-${i}`, { width: 1.9, depth: 46, height: 0.025 }, this.scene); path.position.set(i * 6.7, 0.01, 0); path.material = this.material(`tile-${i}`, i % 2 ? '#405862' : '#3b535d');
      }
      const podium = MeshBuilder.CreateCylinder('center', { diameter: 4.5, height: 0.45, tessellation: 8 }, this.scene); podium.position.set(0, 0.22, -2); podium.material = pale;
      const beacon = MeshBuilder.CreatePolyhedron('beacon', { type: 1, size: 1.25 }, this.scene); beacon.position.set(0, 3.8, -2); beacon.material = edge;
      this.scene.onBeforeRenderObservable.add(() => { if (!this.reduced.matches) beacon.rotation.y += this.engine.getDeltaTime() * 0.00022; });
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const pillar = MeshBuilder.CreateBox(`column-${i}`, { width: 0.55, height: 2.8, depth: 0.55 }, this.scene); pillar.position.set(Math.sin(a) * 23, 1.4, Math.cos(a) * 23); pillar.material = pale; }
    } else if (id === 'island') {
      const water = MeshBuilder.CreateGround('sea', { width: 300, height: 300 }, this.scene); water.position.y = -1.3; water.material = this.material('water', '#438c9d');
      for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2; const r = 23 + (i % 2); const trunk = MeshBuilder.CreateCylinder(`tree-${i}`, { height: 3 + i % 3, diameterTop: 0.25, diameterBottom: 0.6, tessellation: 6 }, this.scene); trunk.position.set(Math.sin(a) * r, 1.2, Math.cos(a) * r); trunk.material = this.material(`trunk-${i}`, '#76644b'); const crown = MeshBuilder.CreateSphere(`leaves-${i}`, { diameter: 4, segments: 3 }, this.scene); crown.position.set(trunk.position.x, 3.8 + i % 3, trunk.position.z); crown.scaling.y = 0.65; crown.material = this.material(`leaf-${i}`, i % 2 ? '#397864' : '#438b6d'); }
      for (let i = 0; i < 8; i++) { const rock = MeshBuilder.CreatePolyhedron(`rock-${i}`, { type: 1, size: 1.2 }, this.scene); rock.position.set(-18 + i * 5, 0.4, 20 + (i % 2)); rock.scaling.y = 0.5; rock.material = pale; }
    } else {
      for (let i = 0; i < 100; i++) { const a = i * 2.39996, h = 12 + (i * 17 % 60), r = 45 + (i % 7) * 7; const star = MeshBuilder.CreateSphere(`star-${i}`, { diameter: i % 11 === 0 ? 0.3 : 0.12, segments: 2 }, this.scene); star.position.set(Math.sin(a) * r, h, Math.cos(a) * r); star.material = edge; }
      const moon = MeshBuilder.CreateSphere('moon', { diameter: 19, segments: 12 }, this.scene); moon.position.set(-37, 23, -55); moon.material = this.material('moon', '#c2c4e2');
      const telescope = MeshBuilder.CreateCylinder('telescope', { height: 6, diameter: 1.5, tessellation: 12 }, this.scene); telescope.position.set(0, 4.5, -22); telescope.rotation.x = -0.8; telescope.material = pale;
      const support = MeshBuilder.CreateCylinder('support', { height: 3, diameter: 0.5, tessellation: 6 }, this.scene); support.position.set(0, 1.5, -22); support.material = edge;
      for (let i = 0; i < 7; i++) { const crater = MeshBuilder.CreateTorus(`crater-${i}`, { diameter: 2 + i % 3, thickness: 0.2, tessellation: 16 }, this.scene); crater.position.set(-18 + i * 6, 0.06, 18 - i % 3 * 2); crater.material = pale; }
    }
    for (const portal of w.portals) {
      const root = new TransformNode(`portal-${portal.target}`, this.scene); root.position.set(portal.x, 0, portal.z);
      const portalMat = this.material(`portal-color-${portal.target}`, WORLDS[portal.target].accent, true);
      for (const x of [-1.6, 1.6]) { const leg = MeshBuilder.CreateBox('portal-leg', { width: 0.25, height: 4.5, depth: 0.4 }, this.scene); leg.position.set(x, 2.25, 0); leg.material = pale; leg.parent = root; }
      const top = MeshBuilder.CreateBox('portal-top', { width: 3.45, height: 0.25, depth: 0.4 }, this.scene); top.position.y = 4.5; top.material = pale; top.parent = root;
      const veil = MeshBuilder.CreatePlane('portal-light', { width: 2.9, height: 4.2 }, this.scene); veil.position.y = 2.2; const mat = portalMat.clone('portal-veil')!; mat.alpha = 0.32; mat.backFaceCulling = false; veil.material = mat; veil.parent = root;
      const threshold = MeshBuilder.CreateBox('threshold', { width: 4, depth: 2.5, height: 0.15 }, this.scene); threshold.position.y = 0.07; threshold.material = portalMat; threshold.parent = root;
    }
  }
  update(players: VisiblePlayer[], own: string) { this.players = players; this.own = own; }
  setOrbitInput(turn: number, tilt: number) { this.turn = turn; this.tilt = tilt; }
  look(dx: number, dy: number) { this.yaw = wrapYaw(this.yaw + dx * 0.002); this.pitch = clampPitch(this.pitch + dy * 0.002); }
  private renderPlayers(dt: number) {
    const visible = this.players.filter(player => player.worldId === this.world);
    const sessions = new Set(visible.map(player => player.session));
    for (const [session, avatar] of this.avatars) if (!sessions.has(session)) { avatar.root.dispose(false, true); this.avatars.delete(session); }
    for (const player of visible) {
      let avatar = this.avatars.get(player.session);
      if (avatar && avatar.color !== player.color) { avatar.root.dispose(false, true); this.avatars.delete(player.session); avatar = undefined; }
      if (!avatar) {
        const root = new TransformNode(`avatar-${player.session}`, this.scene);
        const material = this.material(`outfit-${player.session}`, player.color);
        const body = MeshBuilder.CreateCapsule('avatar-body', { height: 1.25, radius: 0.34, tessellation: 10, subdivisions: 1 }, this.scene); body.position.y = 0.85; body.material = material; body.parent = root;
        const head = MeshBuilder.CreateSphere('avatar-head', { diameter: 0.55, segments: 8 }, this.scene); head.position.y = 1.7; head.material = this.material('face', '#e8ded0'); head.parent = root;
        const visor = MeshBuilder.CreateBox('visor', { width: 0.42, height: 0.15, depth: 0.1 }, this.scene); visor.position.set(0, 1.72, -0.26); visor.material = this.material('visor-dark', '#243c48'); visor.parent = root;
        const shadow = MeshBuilder.CreateDisc('footprint', { radius: 0.53, tessellation: 20 }, this.scene); shadow.rotation.x = Math.PI / 2; shadow.position.y = 0.025; const shadowMat = this.material('shadow', '#17212b'); shadowMat.alpha = 0.25; shadow.material = shadowMat; shadow.parent = root;
        root.position.set(player.x, player.y, player.z); avatar = { root, color: player.color }; this.avatars.set(player.session, avatar);
      }
      const amount = this.reduced.matches ? 1 : Math.min(1, dt * 14);
      avatar.root.position = Vector3.Lerp(avatar.root.position, new Vector3(player.x, player.y, player.z), amount); avatar.root.rotation.y = player.facing;
      if (player.session === this.own) {
        const target = avatar.root.position.add(new Vector3(0, 1.3, 0));
        const horizontal = Math.cos(this.pitch) * ORBIT_RADIUS;
        this.camera.position.set(target.x + Math.sin(this.yaw) * horizontal, target.y + Math.sin(this.pitch) * ORBIT_RADIUS, target.z + Math.cos(this.yaw) * horizontal);
        this.camera.setTarget(target);
      }
    }
  }
  metrics() { return { fps: this.engine.getFps(), world: this.world, meshes: this.scene.meshes.length, materials: this.scene.materials.length, avatars: this.avatars.size, engineScenes: this.engine.scenes.length, yaw: this.yaw, pitch: this.pitch, cameraPosition: this.camera.position.asArray(), cameraRight: this.camera.getDirection(Vector3.Right()).asArray(), position: this.players.find(player => player.session === this.own), renderSize: [this.engine.getRenderWidth(), this.engine.getRenderHeight()], canvasSize: [this.canvas.clientWidth, this.canvas.clientHeight] }; }
}
