export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  tel?: string;
  posts?: string[];
  created_at?: string;
}

