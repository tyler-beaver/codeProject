import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wlmanwagxarhhzilcvgl.supabase.co';
const supabaseKey = 'sb_publishable_RodF8jiMKPh4BRlXtEGMcA_vcxoR5F1'; // Your publishable key

export const supabase = createClient(supabaseUrl, supabaseKey);
