import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://onntepcitnjnyxkhlxpe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubnRlcGNpdG5qbnl4a2hseHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzQxMzQsImV4cCI6MjA3MzYxMDEzNH0.fTVcMrYEuSPYk4AmQQbDYUGFeOxM-dwjfaLlYyEWj1Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
