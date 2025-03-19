
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
