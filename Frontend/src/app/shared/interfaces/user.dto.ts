import type { User } from './user';

/** Cuerpo de POST /register (lo que el backend persiste + contraseña). */
export interface RegisterBody {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  tel?: string;
}

/** Lo que envía el formulario de registro (incluye confirmación de contraseña). */
export type RegisterPayload = RegisterBody & { repeatPassword: string };

/** Campos editables en perfil (similar a `ProfileUpdateData` del profesor + `tel`). */
export interface UserProfileUpdate {
  tel?: string;
  username?: string;
  email?: string;
}

/** Lo que envía el formulario de login (igual que `LoginCredentials` típico). */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Respuesta cruda del API antes de mapear a {@link User}. */
export interface UserApiDto {
  _id: unknown;
  username?: unknown;
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  profilePictureUrl?: unknown;
  tel?: unknown;
  /** Historial de posts (IDs), mismo formato que en Mongo/API. */
  posts?: unknown;
  created_at?: unknown;
}
