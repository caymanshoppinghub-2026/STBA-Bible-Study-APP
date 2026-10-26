import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || "https://ygsatsfcvodstgjhmths.supabase.co/rest/v1/";
const cleanedUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc2F0c2Zjdm9kc3RnamhtdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0ODQxNzUsImV4cCI6MjA5NzA2MDE3NX0.Tc4-IvWSmqADtYd2E5_ja3s3V4-lQ9NU51mjST1sbEU";

const supabase = createClient(cleanedUrl, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('doctrine_tracks').select('*');
  if (error) {
    console.error("Error querying doctrine_tracks:", error);
  } else {
    console.log("Found", data?.length, "records");
    if (data && data.length > 0) {
      console.log("First record keys:", Object.keys(data[0]));
      console.log("Full data sample (first record):", JSON.stringify(data[0], null, 2));
    }
  }
}

test();
