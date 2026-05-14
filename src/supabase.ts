import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdjmkbsvgpcsujvnnifw.supabase.co/rest/v1/";
const supabaseAnonKey = "sb_publishable_s7B2hR5ocBGh7p4VPQbMRQ_v8ylqULS";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);