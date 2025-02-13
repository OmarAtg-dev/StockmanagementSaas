
import { createContext, useContext, useState, useEffect } from "react";
import { mockAuthContext, mockDataFunctions } from "@/utils/mockData";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  session: typeof mockAuthContext.session | null;
  user: typeof mockAuthContext.user | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState(mockAuthContext.session);
  const [user, setUser] = useState(mockAuthContext.user);
  const [profile, setProfile] = useState(mockAuthContext.profile);

  useEffect(() => {
    // Simulate initial session
    mockDataFunctions.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setProfile(mockAuthContext.profile);
    });
  }, []);

  const signOut = async () => {
    try {
      setSession(null);
      setUser(null);
      setProfile(null);
      await mockDataFunctions.signOut();
    } catch (error) {
      console.error("Error in signOut:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut }}>
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
