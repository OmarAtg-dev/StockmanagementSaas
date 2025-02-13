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
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to simulate API call
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

  getClients: async () => {
    // Simulate fetching clients
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        { id: '1', name: 'Client A', email: 'clienta@example.com' },
        { id: '2', name: 'Client B', email: 'clientb@example.com' }
      ],
      error: null
    };
  },

  getProducts: async () => {
    // Simulate fetching products
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        { id: '101', name: 'Product X', price: 25 },
        { id: '102', name: 'Product Y', price: 50 }
      ],
      error: null
    };
  },

  getInvoices: async () => {
    // Simulate fetching invoices
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        { id: 'INV001', number: 'INV001', date: '2024-01-20', total_amount: 150 },
        { id: 'INV002', number: 'INV002', date: '2024-01-25', total_amount: 200 }
      ],
      error: null
    };
  },
};
