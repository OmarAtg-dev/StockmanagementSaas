
import { createContext, useContext, useState } from "react";
import { mockAuthContext, mockDataFunctions } from "@/utils/mockData";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & { user_id: string };

interface AuthContextType {
  session: typeof mockAuthContext.session | null;
  user: typeof mockAuthContext.user | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  setSession: (session: typeof mockAuthContext.session | null) => void;
  setUser: (user: typeof mockAuthContext.user | null) => void;
  setProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  signOut: async () => {},
  setSession: () => {},
  setUser: () => {},
  setProfile: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with null values instead of mock data
  const [session, setSession] = useState<typeof mockAuthContext.session | null>(null);
  const [user, setUser] = useState<typeof mockAuthContext.user | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const signOut = async () => {
    try {
      await mockDataFunctions.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error in signOut:", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        profile, 
        signOut,
        setSession,
        setUser,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
