
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff';

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  role: UserRole;
};
