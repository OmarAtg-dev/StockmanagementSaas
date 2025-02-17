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

// Mock invoice items data store
let mockInvoiceItems = [
  {
    id: '1',
    invoice_id: 'INV001',
    product_id: '101',
    description: 'Laptop Dell XPS 13',
    quantity: 2,
    unit_price: 25000,
    amount: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    invoice_id: 'INV001',
    product_id: '102',
    description: 'Souris sans fil',
    quantity: 3,
    unit_price: 300,
    amount: 900,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock invoices data store
let mockInvoices = [
  { 
    id: 'INV001',
    number: 'INV001',
    date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 50900,
    status: 'pending',
    client_id: '1',
    company_id: '1',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock supplier invoices data store
let mockSupplierInvoices = [
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
];

// Add mock products storage
let mockProducts = [
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

    return {
      data: {
        session: {
          access_token: "mock_token",
          user: { 
            id: String(mockProfiles.length + 1), 
            email: data.email 
          }
        },
        user: {
          id: String(mockProfiles.length + 1),
          email: data.email
        }
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
      data: mockProducts,
      error: null
    };
  },

  createProduct: async (data: Omit<{
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
  }, "id">) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProduct = {
      id: `PROD${Date.now()}`,
      ...data
    };
    mockProducts.push(newProduct);
    return {
      data: newProduct,
      error: null
    };
  },

  updateProduct: async (data: {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockProducts.findIndex(p => p.id === data.id);
    if (index !== -1) {
      mockProducts[index] = data;
    }
    return {
      data,
      error: null
    };
  },

  deleteProduct: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockProducts = mockProducts.filter(p => p.id !== id);
    return {
      error: null
    };
  },

  getInventory: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        {
          id: '1',
          product: { name: 'Ordinateur Portable', category: 'Électronique' },
          quantity: 3,
          location: 'Entrepôt A',
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          product: { name: 'Souris Sans Fil', category: 'Accessoires' },
          quantity: 15,
          location: 'Entrepôt B',
          last_updated: new Date().toISOString()
        },
        {
          id: '3',
          product: { name: 'Écran 27"', category: 'Électronique' },
          quantity: 4,
          location: 'Entrepôt A',
          last_updated: new Date().toISOString()
        },
        {
          id: '4',
          product: { name: 'Clavier Mécanique', category: 'Accessoires' },
          quantity: 2,
          location: 'Entrepôt B',
          last_updated: new Date().toISOString()
        },
        {
          id: '5',
          product: { name: 'Casque Audio', category: 'Audio' },
          quantity: 8,
          location: 'Entrepôt C',
          last_updated: new Date().toISOString()
        },
        {
          id: '6',
          product: { name: 'Webcam HD', category: 'Accessoires' },
          quantity: 5,
          location: 'Entrepôt A',
          last_updated: new Date().toISOString()
        },
        {
          id: '7',
          product: { name: 'Disque SSD 1TB', category: 'Stockage' },
          quantity: 1,
          location: 'Entrepôt B',
          last_updated: new Date().toISOString()
        }
      ],
      error: null
    };
  },

  getExpectedInventory: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        {
          id: 'exp1',
          product: { name: 'Nouveau Smartphone', category: 'Electronics' },
          quantity: 50,
          expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          status: 'confirmed',
          notes: 'Livraison prévue la semaine prochaine'
        },
        {
          id: 'exp2',
          product: { name: 'Écouteurs Sans Fil', category: 'Electronics' },
          quantity: 100,
          expected_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          status: 'pending',
          notes: 'En attente de confirmation du fournisseur'
        },
        {
          id: 'exp3',
          product: { name: 'Bureau Ergonomique', category: 'Office' },
          quantity: 25,
          expected_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          status: 'delayed',
          notes: 'Retard dû aux problèmes de transport'
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
    
    // Map the mock invoices to include client information and items
    const invoicesWithClients = mockInvoices.map(invoice => {
      const client = mockClients.find(c => c.id === invoice.client_id);
      const items = mockInvoiceItems.filter(item => item.invoice_id === invoice.id);
      
      return {
        id: invoice.id,
        number: invoice.number,
        date: invoice.date, // Keep the ISO string format
        due_date: invoice.due_date, // Keep the ISO string format
        total_amount: invoice.total_amount,
        status: invoice.status,
        client: client ? {
          id: client.id,
          name: client.name,
          email: client.email
        } : null,
        items: items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        }))
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
      data: mockSupplierInvoices,
      error: null
    };
  },

  createInvoice: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newInvoice = {
      id: data.id || `INV${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: data.status || 'pending'
    };

    if (data.number?.startsWith('SUPINV-')) {
      // This is a supplier invoice
      mockSupplierInvoices.push({
        ...newInvoice,
        supplier: {
          name: data.supplier_name || 'Unknown Supplier'
        }
      });
    } else {
      // This is a regular invoice
      mockInvoices.push(newInvoice);
    }

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
  },

  getEnterpriseInfo: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: "1",
      name: "Acme Corporation",
      subscription_status: "active",
      created_at: "2024-01-01T00:00:00.000Z",
      user_count: 25,
      contact: {
        headquarters: "123 Boulevard Mohammed V, Casablanca, Maroc",
        branches: [
          "45 Avenue Hassan II, Rabat, Maroc",
          "78 Rue Atlas, Marrakech, Maroc"
        ],
        phone: "+212 522-123456",
        email: "contact@acme-corp.ma",
        website: "www.acme-corp.ma",
        social: {
          linkedin: "linkedin.com/company/acme-corp-ma",
          twitter: "twitter.com/acme_corp_ma"
        }
      },
      inventory: {
        primary_warehouse: {
          name: "Entrepôt Principal Casablanca",
          address: "Zone Industrielle Sidi Maârouf, Casablanca"
        },
        additional_warehouses: [
          {
            name: "Entrepôt Tanger Med",
            address: "Zone Franche Tanger Med"
          }
        ],
        valuation_method: "FIFO",
        stock_thresholds: {
          alert_level: 100,
          reorder_level: 50
        },
        active_suppliers: 12
      }
    };
  },

  updateInvoice: async (updatedInvoice: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockInvoices.findIndex(inv => inv.id === updatedInvoice.id);
    if (index === -1) {
      throw new Error("Invoice not found");
    }

    // Update the invoice in our mock store
    mockInvoices[index] = {
      ...mockInvoices[index],
      date: updatedInvoice.date, // Use the formatted date string directly
      due_date: updatedInvoice.due_date, // Use the formatted date string directly
      total_amount: updatedInvoice.total_amount,
      status: updatedInvoice.status,
      updated_at: new Date().toISOString()
    };

    // Find the client ID based on client info
    const clientId = mockClients.find(c => c.name === updatedInvoice.client?.name)?.id;
    if (clientId) {
      mockInvoices[index].client_id = clientId;
    }

    // Update or replace invoice items
    const existingItems = mockInvoiceItems.filter(item => item.invoice_id === updatedInvoice.id);
    for (const existingItem of existingItems) {
      const updatedItem = updatedInvoice.items.find(item => item.id === existingItem.id);
      if (updatedItem) {
        const itemIndex = mockInvoiceItems.findIndex(item => item.id === existingItem.id);
        mockInvoiceItems[itemIndex] = {
          ...mockInvoiceItems[itemIndex],
          description: updatedItem.description,
          quantity: updatedItem.quantity,
          unit_price: updatedItem.unit_price,
          amount: updatedItem.amount,
          updated_at: new Date().toISOString()
        };
      }
    }

    // When getting invoices, we'll combine this data
    const client = mockClients.find(c => c.id === mockInvoices[index].client_id);
    const items = mockInvoiceItems.filter(item => item.invoice_id === updatedInvoice.id);

    return { 
      data: {
        ...mockInvoices[index],
        client: client ? {
          name: client.name,
          email: client.email
        } : null,
        items: items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        }))
      }, 
      error: null 
    };
  },

  createSupplierInvoice: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newInvoice = {
      id: `SINV${Date.now()}`,
      number: `SUPINV-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: data.status || 'pending'
    };
    mockSupplierInvoices.push(newInvoice);
    return {
      data: newInvoice,
      error: null
    };
  },

  updateSupplierInvoice: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockSupplierInvoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      return { data: null, error: new Error('Invoice not found') };
    }
    mockSupplierInvoices[index] = {
      ...mockSupplierInvoices[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    return {
      data: mockSupplierInvoices[index],
      error: null
    };
  },

  deleteSupplierInvoice: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockSupplierInvoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      return { error: new Error('Invoice not found') };
    }
    mockSupplierInvoices = mockSupplierInvoices.filter(inv => inv.id !== id);
    return { error: null };
  }
};
