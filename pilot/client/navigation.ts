import { WORLDS, type WorldId } from '../shared/worlds.js';

export const ORBIT_RADIUS = Math.hypot(10, 5.5);
export const DEFAULT_PITCH = Math.atan2(5.5, 10);
export const MIN_PITCH = -4 * Math.PI / 180;
export const MAX_PITCH = 80 * Math.PI / 180;
export const clampPitch = (pitch: number) => Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));
export const wrapYaw = (yaw: number) => Math.atan2(Math.sin(yaw), Math.cos(yaw));

// Babylon's left-handed camera looks toward -Z at yaw zero: screen-right is -X.
export function groundMovement(yaw: number, forward: number, right: number) {
  const dx = -Math.sin(yaw) * forward - Math.cos(yaw) * right;
  const dz = -Math.cos(yaw) * forward + Math.sin(yaw) * right;
  const length = Math.max(1, Math.hypot(dx, dz));
  return { dx: dx / length, dz: dz / length, facing: wrapYaw(yaw) };
}

type Position = { x: number; z: number };
type Portal = (typeof WORLDS)[WorldId]['portals'][number];
const inThreshold = (p: Position, portal: Portal) => Math.abs(p.x - portal.x) <= 1.8 && Math.abs(p.z - portal.z) <= 1.25;

// Observe authoritative positions, not interpolated meshes. All built-in gates
// face along Z; their opening is 2.9 metres wide. No position grants authority.
export class PortalCrossings {
  private world?: WorldId;
  private previous?: Position;
  private armed = new Set<WorldId>();
  reset() { this.world = undefined; this.previous = undefined; this.armed.clear(); }
  observe(world: WorldId, position: Position, enabled = true): WorldId | undefined {
    const portals = WORLDS[world].portals;
    const previous = this.previous;
    this.previous = { x: position.x, z: position.z };
    if (this.world !== world || !previous) {
      this.world = world; this.armed.clear();
      for (const portal of portals) if (!inThreshold(position, portal)) this.armed.add(portal.target);
      return;
    }
    let crossed: WorldId | undefined;
    for (const portal of portals) {
      if (!this.armed.has(portal.target)) {
        if (!inThreshold(position, portal)) this.armed.add(portal.target);
        continue;
      }
      const passesPlane = (previous.z < portal.z && position.z >= portal.z) || (previous.z > portal.z && position.z <= portal.z);
      if (!passesPlane) continue;
      const fraction = (portal.z - previous.z) / (position.z - previous.z);
      const crossingX = previous.x + fraction * (position.x - previous.x);
      if (Math.abs(crossingX - portal.x) > 1.45) continue;
      // Consume the crossing even if another command is pending or saving fails.
      this.armed.delete(portal.target);
      if (enabled && !crossed) crossed = portal.target;
    }
    return crossed;
  }
}

export function nearbyPortal(world: WorldId, position: Position) {
  return WORLDS[world].portals.find(portal => Math.hypot(position.x - portal.x, position.z - portal.z) <= 5);
}
