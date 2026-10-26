export const WORLD_VERSION = '1.0.0';
export const FRAME = 'oasis-y-up-metres-v1';
export const COLORS = ['#65dcc0', '#f5bd69', '#b5a2ff', '#ec91af', '#81c9fa'] as const;
export type WorldId = 'hub' | 'island' | 'observatory';
export type Location = { worldId: WorldId; worldVersion: string; frame: string; x: number; y: number; z: number; facing: number };
export type World = { id: WorldId; name: string; subtitle: string; bounds: number; sky: string; ground: string; accent: string; spawn: { x: number; z: number }; portals: { target: WorldId; x: number; z: number }[] };
export const WORLDS: Record<WorldId, World> = {
  hub: { id: 'hub', name: 'The Concourse', subtitle: 'Every journey starts with a shared place.', bounds: 23, sky: '#142638', ground: '#364d58', accent: '#65dcc0', spawn: { x: 0, z: 8 }, portals: [{ target: 'island', x: -9, z: -9 }, { target: 'observatory', x: 9, z: -9 }] },
  island: { id: 'island', name: 'Tideglass Island', subtitle: 'A little room to wander. A horizon to keep.', bounds: 21, sky: '#7fbbca', ground: '#c5b68b', accent: '#276e66', spawn: { x: 0, z: 8 }, portals: [{ target: 'hub', x: 0, z: -13 }, { target: 'observatory', x: 12, z: 0 }] },
  observatory: { id: 'observatory', name: 'Quiet Orbit', subtitle: 'Meet beneath a sky that keeps its own time.', bounds: 21, sky: '#0c112c', ground: '#494a70', accent: '#b5a2ff', spawn: { x: 0, z: 8 }, portals: [{ target: 'hub', x: 0, z: -13 }, { target: 'island', x: -12, z: 0 }] }
};
export const isWorldId = (value: unknown): value is WorldId => typeof value === 'string' && Object.hasOwn(WORLDS, value);
export function spawn(worldId: WorldId): Location {
  return { worldId, worldVersion: WORLD_VERSION, frame: FRAME, ...WORLDS[worldId].spawn, y: 0, facing: 0 };
}
export function validLocation(input: unknown): input is Location {
  if (!input || typeof input !== 'object') return false;
  const value = input as Location;
  if (!isWorldId(value.worldId) || value.worldVersion !== WORLD_VERSION || value.frame !== FRAME) return false;
  return [value.x, value.y, value.z, value.facing].every(v => typeof v === 'number' && Number.isFinite(v)) && Math.hypot(value.x, value.z) <= WORLDS[value.worldId].bounds + 1e-8 && value.y === 0 && Math.abs(value.facing) <= Math.PI;
}
export function stepMovement(location: Location, input: { dx: number; dz: number; facing: number }, dt: number): Location {
  const length = Math.max(1, Math.hypot(input.dx, input.dz));
  const seconds = Math.min(0.1, Math.max(0, dt));
  const limit = WORLDS[location.worldId].bounds;
  let x = location.x + input.dx / length * 5 * seconds, z = location.z + input.dz / length * 5 * seconds;
  const radius = Math.hypot(x, z); if (radius > limit) { x *= limit / radius; z *= limit / radius; }
  return { ...location, x, z, facing: input.facing };
}
