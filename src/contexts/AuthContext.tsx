
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  session: Session | null;
  user: User | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      console.log("Profile data fetched:", profileData);
      setProfile(profileData);

      // If we don't have a company_id in profile, try to get it from company_user_roles
      if (!profileData.company_id) {
        const { data: companyRoleData, error: companyRoleError } = await supabase
          .from("company_user_roles")
          .select("company_id")
          .eq("user_id", userId)
          .single();

        if (!companyRoleError && companyRoleData?.company_id) {
          // Update the profile with the company_id
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({ company_id: companyRoleData.company_id })
            .eq("id", userId)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            console.log("Updated profile with company data:", updatedProfile);
            setProfile(updatedProfile);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session:", initialSession);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log("Auth state change:", _event, newSession);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear all local state immediately
      setSession(null);
      setUser(null);
      setProfile(null);

      // Finally, attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
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
