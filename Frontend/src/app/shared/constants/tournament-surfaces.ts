/** Indoor / outdoor variants for each base court surface (stored as the tournament surface string). */
export const TOURNAMENT_SURFACE_OPTIONS = [
  'INDOOR - HARD',
  'OUTDOOR - HARD',
  'INDOOR - CLAY',
  'OUTDOOR - CLAY',
  'INDOOR - GRASS',
  'OUTDOOR - GRASS',
  'INDOOR - CARPET',
  'OUTDOOR - CARPET',
] as const;

export const DEFAULT_TOURNAMENT_SURFACE = 'OUTDOOR - HARD';

export type TournamentSurfaceOption = (typeof TOURNAMENT_SURFACE_OPTIONS)[number];
