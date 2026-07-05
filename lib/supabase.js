import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase Environment Variables inside .env.local');
}

// நெக்ஸ்ட் ஜேஎஸ் ஆப் முழுவதும் பயன்படுத்தக்கூடிய Supabase கிளைன்ட்
export const supabase = createClient(supabaseUrl, supabaseAnonKey);