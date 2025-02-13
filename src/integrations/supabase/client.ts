
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Using mock values to prevent actual API calls
const SUPABASE_URL = "mock://supabase";
const SUPABASE_PUBLISHABLE_KEY = "mock_key";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false // Disable session persistence
  }
});
