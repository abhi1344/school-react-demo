import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://libcmhdthkedaahenlyc.supabase.co";
const SUPABASE_KEY = "sb_publishable_FoNAgujp8l_HaLlFDiUcJg_xRNBp-xG";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
