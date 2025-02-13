
import { UserRole } from "@/types/auth";

export const mockProfiles = [
  {
    id: "1",
    username: "admin@example.com",
    full_name: "Admin User",
    company_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'admin' as UserRole
  },
  {
    id: "2",
    username: "manager@example.com",
    full_name: "Manager User",
    company_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'manager' as UserRole
  }
];

export const mockCompanies = [
  {
    id: "1",
    name: "Example Company",
    subscription_status: "active",
    user_count: 5,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Test Corp",
    subscription_status: "inactive",
    user_count: 3,
    created_at: new Date().toISOString()
  }
];

export const mockProducts = [
  {
    id: "1",
    name: "Product 1",
    category: "Category A",
    price: 99.99,
    stock: 100,
    status: "En stock",
    company_id: "1"
  },
  {
    id: "2",
    name: "Product 2",
    category: "Category B",
    price: 149.99,
    stock: 50,
    status: "En stock",
    company_id: "1"
  }
];

export const mockClients = [
  {
    id: "1",
    name: "Client Company A",
    email: "contact@clienta.com",
    phone: "+33123456789",
    address: "123 Street, City",
    company_id: "1",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Client Company B",
    email: "contact@clientb.com",
    phone: "+33987654321",
    address: "456 Avenue, City",
    company_id: "1",
    created_at: new Date().toISOString()
  }
];

export const mockSuppliers = [
  {
    id: "1",
    name: "Supplier A",
    email: "contact@suppliera.com",
    phone: "+33123456789",
    address: "789 Road, City",
    contact_person: "John Doe",
    status: "active",
    company_id: "1"
  },
  {
    id: "2",
    name: "Supplier B",
    email: "contact@supplierb.com",
    phone: "+33987654321",
    address: "321 Boulevard, City",
    contact_person: "Jane Smith",
    status: "active",
    company_id: "1"
  }
];

export const mockInvoices = [
  {
    id: "1",
    number: "INV-2024-001",
    date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 1499.99,
    status: "pending",
    client: {
      name: "Client Company A",
      email: "contact@clienta.com"
    },
    company_id: "1"
  },
  {
    id: "2",
    number: "INV-2024-002",
    date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 2499.99,
    status: "paid",
    client: {
      name: "Client Company B",
      email: "contact@clientb.com"
    },
    company_id: "1"
  }
];

export const mockInventory = [
  {
    id: "1",
    quantity: 100,
    location: "Warehouse A",
    last_updated: new Date().toISOString(),
    product: {
      name: "Product 1",
      category: "Category A"
    },
    company_id: "1"
  },
  {
    id: "2",
    quantity: 50,
    location: "Warehouse B",
    last_updated: new Date().toISOString(),
    product: {
      name: "Product 2",
      category: "Category B"
    },
    company_id: "1"
  }
];

// Mock authentication context
export const mockAuthContext = {
  session: {
    user: {
      id: "1",
      email: "admin@example.com"
    }
  },
  user: {
    id: "1",
    email: "admin@example.com"
  },
  profile: mockProfiles[0],
  signOut: async () => {
    console.log("Mock sign out");
  }
};

// Mock data management functions
export const mockDataFunctions = {
  // Auth functions
  getSession: async () => ({ data: { session: mockAuthContext.session } }),
  signOut: async () => ({ error: null }),
  
  // Profile functions
  updateProfile: async (updates: Partial<typeof mockProfiles[0]>) => {
    console.log("Mock update profile:", updates);
    return { data: { ...mockProfiles[0], ...updates }, error: null };
  },
  
  // Password update
  updatePassword: async (password: string) => {
    console.log("Mock update password:", password);
    return { error: null };
  },

  // Company functions
  getCompanies: async () => ({ data: mockCompanies, error: null }),
  createCompany: async (data: Partial<typeof mockCompanies[0]>) => {
    console.log("Mock create company:", data);
    return { data: { ...mockCompanies[0], ...data }, error: null };
  },
  
  // Products functions
  getProducts: async () => ({ data: mockProducts, error: null }),
  createProduct: async (data: Partial<typeof mockProducts[0]>) => {
    console.log("Mock create product:", data);
    return { data: { ...mockProducts[0], ...data }, error: null };
  },
  
  // Clients functions
  getClients: async () => ({ data: mockClients, error: null }),
  createClient: async (data: Partial<typeof mockClients[0]>) => {
    console.log("Mock create client:", data);
    return { data: { ...mockClients[0], ...data }, error: null };
  },
  
  // Suppliers functions
  getSuppliers: async () => ({ data: mockSuppliers, error: null }),
  createSupplier: async (data: Partial<typeof mockSuppliers[0]>) => {
    console.log("Mock create supplier:", data);
    return { data: { ...mockSuppliers[0], ...data }, error: null };
  },
  
  // Invoices functions
  getInvoices: async () => ({ data: mockInvoices, error: null }),
  createInvoice: async (data: Partial<typeof mockInvoices[0]>) => {
    console.log("Mock create invoice:", data);
    return { data: { ...mockInvoices[0], ...data }, error: null };
  },
  
  // Inventory functions
  getInventory: async () => ({ data: mockInventory, error: null }),
  updateInventory: async (data: Partial<typeof mockInventory[0]>) => {
    console.log("Mock update inventory:", data);
    return { data: { ...mockInventory[0], ...data }, error: null };
  }
};
