import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
