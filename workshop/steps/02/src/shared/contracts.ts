import type { Location } from './worlds.js';
export type Profile = { id:string;name:string;color:string;location:Location;revision:number };
export type MovementInput = { seq:number;dx:number;dz:number;facing:number };
export type VisiblePlayer = Location & { session:string;name:string;color:string };
