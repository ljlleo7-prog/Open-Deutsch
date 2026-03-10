
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkPrompts() {
  const { data, error } = await supabase
    .from('opendeutsch_exercises_database')
    .select('id, prompt, options')
    .not('prompt', 'ilike', '%Buchstabe%')
    .not('prompt', 'ilike', '%Alphabet%')
    .limit(10);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

checkPrompts();
