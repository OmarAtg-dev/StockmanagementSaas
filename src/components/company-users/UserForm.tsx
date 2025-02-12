
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyUser } from "@/types/company-user";

interface UserFormProps {
  user?: CompanyUser;
  companyId: string;
  onSubmit: (data: {
    email: string;
    password?: string;
    full_name: string;
    role: "admin" | "manager" | "staff";
  }) => void;
  onClose: () => void;
}

export const UserForm = ({ user, onSubmit, onClose }: UserFormProps) => {
  const [email, setEmail] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [role, setRole] = useState<"admin" | "manager" | "staff">(
    user?.role || "staff"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      email,
      full_name: fullName,
      role,
    } as any;

    // Only include password if it's provided (for editing) or if it's a new user
    if (password || !user) {
      formData.password = password;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email de l'utilisateur
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          {user ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!user} // Only required for new users
          minLength={6}
          placeholder={user ? "Laisser vide pour ne pas changer" : ""}
        />
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Nom complet
        </label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Rôle
        </label>
        <Select value={role} onValueChange={(value: "admin" | "manager" | "staff") => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">{user ? "Modifier" : "Ajouter"}</Button>
      </div>
    </form>
  );
};
