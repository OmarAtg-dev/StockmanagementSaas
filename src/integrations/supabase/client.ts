// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ewtecjzneuiwcoxnhktg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dGVjanpuZXVpd2NveG5oa3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MDE5NjMsImV4cCI6MjA1NDk3Nzk2M30.W9QIqMdrE32rlIQ5TwHU4oRgQvH-oglN8Kqchmqjqng";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);