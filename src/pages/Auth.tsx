
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
    companyName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with:", formData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.error("Sign in error:", error);
        if (error.message === "Invalid login credentials") {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Email ou mot de passe incorrect. Veuillez réessayer.",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email non confirmé",
            description: "Veuillez confirmer votre email avant de vous connecter.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: error.message,
          });
        }
        return;
      }

      console.log("Sign in successful:", data);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Starting signup process for:", formData.email);
      
      // 1. Create company first
      console.log("Creating company:", formData.companyName);
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert([{ 
          name: formData.companyName,
          subscription_status: 'active'
        }])
        .select()
        .single();

      if (companyError) {
        console.error("Error creating company:", companyError);
        throw new Error("Erreur lors de la création de l'entreprise");
      }

      console.log("Company created successfully:", companyData);

      // 2. Create user
      console.log("Creating user account");
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        // If user creation fails, delete the company
        await supabase
          .from("companies")
          .delete()
          .eq("id", companyData.id);
          
        if (signUpError.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: "Un compte existe déjà avec cet email.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: signUpError.message,
          });
        }
        return;
      }

      // 3. Create profile and link to company
      if (userData.user) {
        console.log("Creating user profile");
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userData.user.id,
              username: formData.username,
              full_name: formData.fullName,
              company_id: companyData.id,
              role: 'admin', // First user is admin
            },
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw new Error("Erreur lors de la création du profil");
        }

        // 4. Create company user role for backwards compatibility
        console.log("Creating company user role");
        const { error: roleError } = await supabase
          .from("company_user_roles")
          .insert([
            {
              user_id: userData.user.id,
              company_id: companyData.id,
              role: 'admin', // First user is admin
            },
          ]);

        if (roleError) {
          console.error("Error creating role:", roleError);
          throw new Error("Erreur lors de la création du rôle");
        }
      }

      console.log("Signup process completed successfully");
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      });
      
      // Reset form after successful signup
      setFormData({
        email: "",
        password: "",
        username: "",
        fullName: "",
        companyName: "",
      });
      
    } catch (error: any) {
      console.error("Signup process error:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Une erreur inattendue s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>
                  Connectez-vous à votre compte StockSy
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>
                  Créez votre compte StockSy
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder="Ma Société"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
