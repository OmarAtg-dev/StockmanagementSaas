
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Package, Search, Plus } from "lucide-react";
import { useState } from "react";

// Exemple de données de produits
const productsData = [
  {
    id: 1,
    name: "iPhone 14 Pro",
    category: "Téléphones",
    price: 1299,
    stock: 45,
    status: "En stock",
  },
  {
    id: 2,
    name: "MacBook Air M2",
    category: "Ordinateurs",
    price: 1499,
    stock: 32,
    status: "En stock",
  },
  {
    id: 3,
    name: "AirPods Pro",
    category: "Accessoires",
    price: 279,
    stock: 78,
    status: "En stock",
  },
  {
    id: 4,
    name: "iPad Air",
    category: "Tablettes",
    price: 789,
    stock: 12,
    status: "Stock faible",
  },
  {
    id: 5,
    name: "Apple Watch Series 8",
    category: "Montres",
    price: 499,
    stock: 56,
    status: "En stock",
  },
];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = productsData.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
            <p className="text-muted-foreground">
              Gérez votre catalogue de produits
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            <Plus className="h-5 w-5" />
            Ajouter un produit
          </button>
        </div>

        <Card>
          <div className="p-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price} €</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === "En stock"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Products;
