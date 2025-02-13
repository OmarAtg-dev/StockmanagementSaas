import { UserRole } from "@/types/auth";

export const mockProfiles = [
  {
    id: "1",
    user_id: "1",
    username: "aitogram.omar1@gmail.com",
    full_name: "Omar",
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

// Mock clients data store
let mockClients = [
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
];

// Mock invoices data store
let mockInvoices = [
  { 
    id: 'INV001',
    number: 'INV001',
    date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 150,
    status: 'pending',
    client_id: '1',
    company_id: '1',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock invoice items data store
let mockInvoiceItems = [
  {
    id: '1',
    invoice_id: 'INV001',
    product_id: '101',
    description: 'Product X',
    quantity: 1,
    unit_price: 150,
    amount: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockAuthContext = {
  session: {
    access_token: "mock_access_token",
    refresh_token: "mock_refresh_token",
    user: {
      id: "1",
      email: "aitogram.omar1@gmail.com"
    }
  },
  user: {
    id: "1",
    email: "aitogram.omar1@gmail.com"
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
    
    if (email === "aitogram.omar1@gmail.com" && password === "StockManagement@123") {
      const user = mockProfiles[0];
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
    }
    
    return {
      data: null,
      error: { message: "Email ou mot de passe incorrect" }
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
      data: mockClients,
      error: null
    };
  },

  createClient: async (data: { 
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    company_id: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newClient = {
      id: String(mockClients.length + 1),
      ...data,
      created_at: new Date().toISOString()
    };
    mockClients.push(newClient);
    return { error: null };
  },

  updateClient: async (id: string, data: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockClients.findIndex(client => client.id === id);
    if (index === -1) {
      return { error: { message: "Client non trouvé" } };
    }
    mockClients[index] = { ...mockClients[index], ...data };
    return { error: null };
  },

  deleteClient: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockClients.findIndex(client => client.id === id);
    if (index === -1) {
      return { error: { message: "Client non trouvé" } };
    }
    mockClients = mockClients.filter(client => client.id !== id);
    return { error: null };
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
    
    // Map the mock invoices to include client information
    const invoicesWithClients = mockInvoices.map(invoice => {
      const client = mockClients.find(c => c.id === invoice.client_id);
      return {
        id: invoice.id,
        number: invoice.number,
        date: invoice.date,
        due_date: invoice.due_date,
        total_amount: invoice.total_amount,
        status: invoice.status,
        client: client ? {
          name: client.name,
          email: client.email
        } : null
      };
    });

    return {
      data: invoicesWithClients,
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
  },

  createInvoice: async (data: {
    client_id: string;
    company_id: string;
    number: string;
    date: string;
    due_date: string;
    total_amount: number;
    notes?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newInvoice = {
      id: `INV${Date.now()}`,
      ...data,
      status: 'pending',
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockInvoices.push(newInvoice);
    return {
      data: [newInvoice],
      error: null
    };
  },

  createInvoiceItems: async (items: {
    invoice_id: string;
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }[]) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newItems = items.map(item => ({
      id: `ITEM${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      product_id: item.product_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    mockInvoiceItems.push(...newItems);
    return {
      data: newItems,
      error: null
    };
  }
};
