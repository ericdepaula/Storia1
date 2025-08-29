import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ADICIONE ESTES LOGS PARA VERIFICAR AS VARIÁVEIS
console.log("VITE_SUPABASE_URL no Cliente:", supabaseUrl);
console.log("VITE_SUPABASE_ANON_KEY no Cliente:", supabaseAnonKey ? "Definida" : "NÃO DEFINIDA");

export const supabase = createClient(supabaseUrl, supabaseAnonKey)