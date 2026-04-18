export const validationKeys = {
  invalidEmail: 'invalidEmail',
  invalidDate: 'invalidDate',
  invalidDateRange: 'invalidDateRange',
  transportTypesRequired: 'transportTypesRequired',
  invalidDistance: 'invalidDistance',
  passwordStrength: 'passwordStrength',
  usernameLetters: 'usernameLetters',
  passwordsMismatch: 'passwordsMismatch',
} as const;

export type ValidationKey = (typeof validationKeys)[keyof typeof validationKeys];

export const passwordStrengthReason = {
  minLength: 'minLength',
  letterAndNumber: 'letterAndNumber',
} as const;

export type PasswordStrengthReason =
  (typeof passwordStrengthReason)[keyof typeof passwordStrengthReason];
