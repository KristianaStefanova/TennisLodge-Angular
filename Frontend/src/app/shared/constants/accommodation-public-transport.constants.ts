export const PUBLIC_TRANSPORT_TYPE_IDS = [
  'metro',
  'train',
  'bus',
  'tram',
  'regional_rail',
  'ferry',
  'other',
] as const;

export type PublicTransportType = (typeof PUBLIC_TRANSPORT_TYPE_IDS)[number];

export const PUBLIC_TRANSPORT_OPTIONS: ReadonlyArray<{ id: PublicTransportType; label: string }> = [
  { id: 'metro', label: 'Metro / subway' },
  { id: 'train', label: 'Train' },
  { id: 'bus', label: 'Bus' },
  { id: 'tram', label: 'Tram / light rail' },
  { id: 'regional_rail', label: 'Regional rail (Cercanías, etc.)' },
  { id: 'ferry', label: 'Ferry / boat' },
  { id: 'other', label: 'Other' },
];

export function isPublicTransportType(value: string): value is PublicTransportType {
  return (PUBLIC_TRANSPORT_TYPE_IDS as readonly string[]).includes(value);
}

export function formatPublicTransportLine(
  hasNearby: boolean,
  types: readonly PublicTransportType[],
): string {
  if (!hasNearby) {
    return 'No public transport nearby';
  }
  if (!types.length) {
    return 'Public transport nearby';
  }
  const map = new Map(PUBLIC_TRANSPORT_OPTIONS.map((o) => [o.id, o.label]));
  return `Nearby public transport: ${types.map((t) => map.get(t) ?? t).join(', ')}`;
}
