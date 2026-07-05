import { createClient } from '@supabase/supabase-js';

// Hardcoding the keys directly so Next.js doesn't have to read .env.local
const supabaseUrl = 'https://ucxkelhwuvherrkwscqr.supabase.co';
const supabaseAnonKey = 'sb_publishable_iqp28X4gEZCM2YebTyVq5Q_JesNW0qw'; // <--- PASTE YOUR FULL ANON KEY HERE

export const supabase = createClient(supabaseUrl, supabaseAnonKey);