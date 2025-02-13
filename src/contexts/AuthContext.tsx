
import { createContext, useContext, useState, useEffect } from "react";
import { mockAuthContext, mockDataFunctions } from "@/utils/mockData";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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
  const [session, setSession] = useState(mockAuthContext.session);
  const [user, setUser] = useState(mockAuthContext.user);
  const [profile, setProfile] = useState(mockAuthContext.profile);

  useEffect(() => {
    // Simulate initial session
    mockDataFunctions.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setProfile(mockAuthContext.profile);
    });
  }, []);

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
