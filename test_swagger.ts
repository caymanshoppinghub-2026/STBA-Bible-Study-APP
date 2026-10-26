import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || "https://ygsatsfcvodstgjhmths.supabase.co/rest/v1/";
const cleanedUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
const url = `${cleanedUrl}/rest/v1/`;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc2F0c2Zjdm9kc3RnamhtdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0ODQxNzUsImV4cCI6MjA5NzA2MDE3NX0.Tc4-IvWSmqADtYd2E5_ja3s3V4-lQ9NU51mjST1sbEU";

async function getSwagger() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const swagger = (await res.json()) as any;
    console.log("Tables found in OpenAPI spec:", Object.keys(swagger.definitions || {}));
    if (swagger.definitions && swagger.definitions.doctrine_tracks) {
      console.log("doctrine_tracks schema:", JSON.stringify(swagger.definitions.doctrine_tracks, null, 2));
    }
    if (swagger.definitions && swagger.definitions.track_progress) {
      console.log("track_progress schema:", JSON.stringify(swagger.definitions.track_progress, null, 2));
    }
  } catch (err) {
    console.error("Error fetching OpenAPI:", err);
  }
}

getSwagger();
