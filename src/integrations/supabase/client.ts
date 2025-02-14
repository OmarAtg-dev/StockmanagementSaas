
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { mockDataFunctions } from '@/utils/mockData';

const SUPABASE_URL = "mock://supabase";
const SUPABASE_PUBLISHABLE_KEY = "mock_key";

const mockSupabase = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          switch (table) {
            case 'supplier_invoices':
              return mockDataFunctions.createSupplierInvoice(data[0]);
            case 'supplier_invoice_items':
              return mockDataFunctions.createInvoiceItems(data);
            default:
              throw new Error(`Table ${table} not implemented in mock`);
          }
        }
      })
    }),
    update: (data: any) => ({
      eq: (field: string, value: string) => ({
        select: () => ({
          single: async () => {
            if (table === 'supplier_invoices') {
              return mockDataFunctions.updateSupplierInvoice(value, data);
            }
            throw new Error(`Table ${table} not implemented in mock`);
          }
        })
      })
    }),
    delete: () => ({
      eq: (field: string, value: string) => ({
        single: async () => {
          if (table === 'supplier_invoices') {
            return mockDataFunctions.deleteSupplierInvoice(value);
          }
          throw new Error(`Table ${table} not implemented in mock`);
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
