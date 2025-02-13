
import { UserRole } from "@/types/auth";

export const mockProfiles = [
  {
    id: "1",
    user_id: "1",
    username: "admin@example.com",
    full_name: "Admin User",
    company_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'admin' as UserRole
  },
  {
    id: "2",
    user_id: "2",
    username: "manager@example.com",
    full_name: "Manager User",
    company_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'manager' as UserRole
  }
];

export const mockAuthContext = {
  session: {
    access_token: "mock_access_token",
    refresh_token: "mock_refresh_token",
    user: {
      id: "1",
      email: "admin@example.com"
    }
  },
  user: {
    id: "1",
    email: "admin@example.com"
  },
  profile: mockProfiles[0]
};

export const mockDataFunctions = {
  getSession: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      data: {
        session: mockAuthContext.session
      },
      error: null
    };
  },

  signIn: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockProfiles.find(p => p.username === email);
    if (!user) {
      return {
        data: null,
        error: { message: "Email ou mot de passe incorrect" }
      };
    }

    return {
      data: {
        session: {
          access_token: "mock_token",
          user: { id: user.id, email: user.username }
        },
        user
      },
      error: null
    };
  },

  signUp: async (data: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    companyName: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mockProfiles.some(p => p.username === data.email)) {
      return {
        data: null,
        error: { message: "Un utilisateur avec cet email existe déjà" }
      };
    }

    const newUser = {
      id: String(mockProfiles.length + 1),
      user_id: String(mockProfiles.length + 1),
      username: data.email,
      full_name: data.fullName,
      company_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: 'admin' as UserRole
    };

    mockProfiles.push(newUser);

    return {
      data: {
        session: {
          access_token: "mock_token",
          user: { id: newUser.id, email: newUser.username }
        },
        user: newUser
      },
      error: null
    };
  },

  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { error: null };
  },

  updateProfile: async (updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { user: updates }, error: null };
  },

  updatePassword: async (password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { error: null };
  },

  getClients: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        { 
          id: '1', 
          name: 'Client A', 
          email: 'clienta@example.com',
          phone: '+33 1 23 45 67 89',
          address: '123 Rue de Paris',
          created_at: new Date().toISOString()
        },
        { 
          id: '2', 
          name: 'Client B', 
          email: 'clientb@example.com',
          phone: '+33 9 87 65 43 21',
          address: '456 Avenue des Champs-Élysées',
          created_at: new Date().toISOString()
        }
      ],
      error: null
    };
  },

  getProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        { 
          id: '101', 
          name: 'Product X', 
          price: 25,
          category: 'Electronics',
          stock: 100,
          status: 'En stock'
        },
        { 
          id: '102', 
          name: 'Product Y', 
          price: 50,
          category: 'Office',
          stock: 75,
          status: 'En stock'
        }
      ],
      error: null
    };
  },

  getInventory: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        {
          id: '1',
          product: { name: 'Product X', category: 'Electronics' },
          quantity: 100,
          location: 'Warehouse A',
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          product: { name: 'Product Y', category: 'Office' },
          quantity: 75,
          location: 'Warehouse B',
          last_updated: new Date().toISOString()
        }
      ],
      error: null
    };
  },

  getSuppliers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        {
          id: '1',
          name: 'Supplier A',
          email: 'suppliera@example.com',
          phone: '+33 1 11 11 11 11',
          address: '789 Boulevard Haussmann',
          contact_person: 'John Doe',
          status: 'active'
        },
        {
          id: '2',
          name: 'Supplier B',
          email: 'supplierb@example.com',
          phone: '+33 2 22 22 22 22',
          address: '321 Rue de Rivoli',
          contact_person: 'Jane Smith',
          status: 'active'
        }
      ],
      error: null
    };
  },

  getInvoices: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        { 
          id: 'INV001', 
          number: 'INV001', 
          date: new Date().toISOString(), 
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 150,
          status: 'paid',
          client: {
            name: 'Client A',
            email: 'clienta@example.com'
          }
        },
        { 
          id: 'INV002', 
          number: 'INV002', 
          date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 200,
          status: 'pending',
          client: {
            name: 'Client B',
            email: 'clientb@example.com'
          }
        }
      ],
      error: null
    };
  },

  getSupplierInvoices: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        {
          id: 'SINV001',
          number: 'SINV001',
          date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 1500,
          status: 'paid',
          supplier: {
            name: 'Supplier A'
          }
        },
        {
          id: 'SINV002',
          number: 'SINV002',
          date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 2000,
          status: 'pending',
          supplier: {
            name: 'Supplier B'
          }
        }
      ],
      error: null
    };
  }
};
