import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Carrega as variáveis do nosso arquivo .env para o ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Criamos o nosso "rádio especial" (o cliente) com as credenciais.
// A partir de agora, usaremos a variável 'supabase' para falar com o banco.
const supabase = createClient(supabaseUrl, supabaseKey);
// Verificamos se as variáveis de ambiente foram definidas corretamente
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "Definido" : "Não Definido");


// Exportamos o cliente para que o resto da nossa aplicação possa usá-lo.
export default supabase;
