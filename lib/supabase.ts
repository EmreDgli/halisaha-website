import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  roles: ("player" | "field_owner" | "team_manager")[]
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  logo_url?: string
  manager_id: string
  max_players: number
  city?: string
  district?: string
  skill_level?: string
  created_at: string
  updated_at: string
}

export interface Field {
  id: string
  name: string
  description?: string
  address: string
  latitude?: number
  longitude?: number
  owner_id: string
  hourly_rate: number
  capacity: number
  amenities: string[]
  images: string[]
  rating: number
  total_ratings: number
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  title: string
  description?: string
  field_id: string
  organizer_team_id?: string
  opponent_team_id?: string
  match_date: string
  duration_minutes: number
  max_players_per_team: number
  entry_fee: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  organizer_score?: number
  opponent_score?: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  match_id?: string
  amount: number
  currency: string
  payment_method: string
  transaction_id?: string
  status: "pending" | "completed" | "failed" | "refunded"
  created_at: string
  updated_at: string
}

export interface MatchVideo {
  id: string
  match_id: string
  uploader_id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  duration_seconds?: number
  is_public: boolean
  views: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  related_id?: string
  is_read: boolean
  created_at: string
}
