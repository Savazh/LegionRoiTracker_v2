import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://dpvwukegbhgdzamzgelm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdnd1a2VnYmhnZHphbXpnZWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDA1MTUsImV4cCI6MjA1MjAxNjUxNX0.taHSWVOeai7BXi_qMRxthbrXJOOzO5Lzbaue-DUkfNY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable session persistence since we're not using auth
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 1
    }
  }
});

// Helper function to check if Supabase is accessible
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .select('count')
      .limit(1)
      .single();
    
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}