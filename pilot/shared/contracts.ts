import type { Location, WorldId } from './worlds.js';
export type Appearance = { color: string };
export type Profile = Appearance & { id: string; name: string; location: Location; revision: number; updatedAt: string };
export type MovementInput = { seq: number; dx: number; dz: number; facing: number };
export type PilotCommand =
  | { requestId: string; type: 'travel'; target: WorldId }
  | { requestId: string; type: 'appearance'; color: string }
  | { requestId: string; type: 'save' };
export type SavedMessage = { profile: Profile; confirmed: true };
export type VisiblePlayer = Appearance & { session: string; name: string; worldId: string; x: number; y: number; z: number; facing: number };
