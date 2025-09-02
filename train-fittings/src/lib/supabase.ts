// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pyyiixzjuxiixkbssigs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eWlpeHpqdXhpaXhrYnNzaWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MjQxNzYsImV4cCI6MjA3MjQwMDE3Nn0.HzZr6uQS5nKT3q8Q4OHqehYWR85okidi4ZqxwxJ1tYk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)