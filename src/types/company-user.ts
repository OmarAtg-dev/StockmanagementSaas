
export type CompanyUser = {
  id: string;
  user_id: string;
  company_id: string;
  role: "admin" | "manager" | "staff";
  full_name: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
};
