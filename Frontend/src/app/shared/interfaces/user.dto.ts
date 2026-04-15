import type { User } from './user.interface';

export interface RegisterBody {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  tel?: string;
}

export type RegisterPayload = RegisterBody & { repeatPassword: string };

export interface UserProfileUpdate {
  tel?: string;
  username?: string;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserApiDto {
  _id: unknown;
  username?: unknown;
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  profilePictureUrl?: unknown;
  tel?: unknown;
  posts?: unknown;
  created_at?: unknown;
}
