
import { UserRole } from "./auth";

export type CompanyUser = {
  id: string;
  user_id: string;
  company_id: string;
  role: UserRole;
  full_name: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
};
