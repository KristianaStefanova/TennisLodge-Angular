import type { NewUserWithCredentials } from './user';

export interface UserProfileUpdate {
  tel?: string;
  username?: string;
  email?: string;
}

export interface UserApiDto {
  _id: unknown;
  username?: unknown;
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  profilePictureUrl?: unknown;
  tel?: unknown;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type RegisterPayload = NewUserWithCredentials & {
  repeatPassword: string;
};
