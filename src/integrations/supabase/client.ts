
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { mockDataFunctions } from '@/utils/mockData';

// Using mock values to prevent actual API calls
const SUPABASE_URL = "mock://supabase";
const SUPABASE_PUBLISHABLE_KEY = "mock_key";

const mockSupabase = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          switch (table) {
            case 'invoices':
              return mockDataFunctions.createInvoice(data[0]);
            case 'invoice_items':
              return mockDataFunctions.createInvoiceItems(data);
            case 'supplier_invoices':
              // Handle supplier invoices with proper supplier association
              return mockDataFunctions.createInvoice({
                ...data[0],
                supplier_id: data[0].supplier_id, // Ensure supplier_id is passed through
                number: `SUPINV-${Date.now()}`, // Ensure unique number format for supplier invoices
              });
            case 'supplier_invoice_items':
              // Handle supplier invoice items the same way as regular invoice items
              return mockDataFunctions.createInvoiceItems(data);
            default:
              throw new Error(`Table ${table} not implemented in mock`);
          }
        }
      })
    }),
    select: () => ({
      single: async () => {
        return { data: null, error: null };
      }
    })
  })
};

export const supabase = mockSupabase as unknown as ReturnType<typeof createClient<Database>>;
