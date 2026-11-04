import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export type DropLocation = {
  id: string;
  venue_name: string;
  address?: string;
  dock_instructions?: string;
  access_code?: string;
  lat: number;
  lng: number;
  image_url?: string;
  created_at?: string;
};