
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserCircle } from "lucide-react";
import { UserRole } from "@/types/auth";

const Settings = () => {
  const { profile, session } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfile = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.fullName,
          role: (profile?.role || 'user') as UserRole 
        })
        .eq('id', session?.user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.rpc('update_user_password', {
        user_id: session?.user.id,
        new_password: formData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos paramètres de compte et de sécurité
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Profil</h2>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user.email}
                  disabled
                  className="max-w-md"
                />
              </div>
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="max-w-md"
                />
              </div>
              <Button
                onClick={updateProfile}
                disabled={isLoading}
              >
                Mettre à jour le profil
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Sécurité</h2>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Ancien mot de passe</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={formData.oldPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, oldPassword: e.target.value })
                  }
                  className="max-w-md"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="max-w-md"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="max-w-md"
                />
              </div>
              <Button
                onClick={updatePassword}
                disabled={isLoading}
              >
                Mettre à jour le mot de passe
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
