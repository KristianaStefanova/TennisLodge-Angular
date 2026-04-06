/**
 * Single source of truth for custom reactive-form validation error keys.
 * Use with `control.errors`, `control.hasError(key)`, and `group.hasError(key)`.
 */
export const validationKeys = {
  invalidEmail: 'invalidEmail',
  passwordStrength: 'passwordStrength',
  usernameLetters: 'usernameLetters',
  passwordsMismatch: 'passwordsMismatch',
} as const;

export type ValidationKey = (typeof validationKeys)[keyof typeof validationKeys];

/** Payload reasons returned under {@link validationKeys.passwordStrength}. */
export const passwordStrengthReason = {
  minLength: 'minLength',
  letterAndNumber: 'letterAndNumber',
} as const;

export type PasswordStrengthReason =
  (typeof passwordStrengthReason)[keyof typeof passwordStrengthReason];
