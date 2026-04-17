import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const PRICES = {
  1: 35, 2: 50, 3: 70, 4: 90, 5: 110, 10: 210, 20: 410
}

export function getPrice(credits) {
  if (PRICES[credits]) return PRICES[credits]
  return credits * 35
} 

