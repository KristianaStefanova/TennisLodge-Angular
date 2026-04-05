export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  tel?: string;
}

export interface UserWithCredentials extends User {
  password: string;
}

export type NewUserWithCredentials = Omit<UserWithCredentials, '_id'> & {
  tel?: string;
};

export function omitPassword<T extends { password: string }>(value: T): Omit<T, 'password'> {
  const { password: _secret, ...publicFields } = value;
  return publicFields;
}
