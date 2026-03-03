export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
}

export type PermissionKey = `${string}:${string}`; // e.g. "pages:create"

export interface UserWithRoles extends User {
  roles: Role[];
  permissions: PermissionKey[];
}
