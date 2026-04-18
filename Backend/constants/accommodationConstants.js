/** Allowed values for `publicTransportTypes` (multi-select when host indicates transit nearby). */
const PUBLIC_TRANSPORT_TYPES = [
  'metro',
  'train',
  'bus',
  'tram',
  'regional_rail',
  'ferry',
  'other',
];

function isValidPublicTransportType(value) {
  return typeof value === 'string' && PUBLIC_TRANSPORT_TYPES.includes(value);
}

module.exports = {
  PUBLIC_TRANSPORT_TYPES,
  isValidPublicTransportType,
};
