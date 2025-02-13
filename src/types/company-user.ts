
export type CompanyUser = {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string | null;
  username: string | null;
  role: string;
  created_at: string;
};

export type UserFormData = {
  email: string;
  password?: string;
  full_name: string;
  role: string;
};
