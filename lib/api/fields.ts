"use client"

import { supabase } from "../supabase"

// Create new field
export async function createField(fieldData: {
  name: string
  description?: string
  address: string
  latitude?: number
  longitude?: number
  hourly_rate: number
  capacity?: number
  amenities?: string[]
  images?: string[]
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("fields")
      .insert({
        ...fieldData,
        owner_id: user.id,
        capacity: fieldData.capacity || 22,
        amenities: fieldData.amenities || [],
        images: fieldData.images || [],
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get all fields with filters
export async function getFields(filters?: {
  city?: string
  min_rating?: number
  max_hourly_rate?: number
  amenities?: string[]
  search?: string
}) {
  try {
    let query = supabase.from("fields").select(`
        *,
        owner:users!fields_owner_id_fkey(full_name, phone, avatar_url)
      `)

    if (filters?.min_rating) {
      query = query.gte("rating", filters.min_rating)
    }

    if (filters?.max_hourly_rate) {
      query = query.lte("hourly_rate", filters.max_hourly_rate)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      query = query.contains("amenities", filters.amenities)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get field details
export async function getFieldDetails(fieldId: string) {
  try {
    const { data, error } = await supabase
      .from("fields")
      .select(`
        *,
        owner:users!fields_owner_id_fkey(full_name, phone, avatar_url),
        ratings:field_ratings(
          rating, comment, created_at,
          user:users(full_name, avatar_url),
          match:matches(title, match_date)
        )
      `)
      .eq("id", fieldId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Rate field
export async function rateField(fieldId: string, rating: number, comment?: string, matchId?: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("field_ratings")
      .insert({
        field_id: fieldId,
        user_id: user.id,
        rating,
        comment,
        match_id: matchId,
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get field ratings
export async function getFieldRatings(fieldId: string) {
  try {
    const { data, error } = await supabase
      .from("field_ratings")
      .select(`
        *,
        user:users(full_name, avatar_url),
        match:matches(title, match_date)
      `)
      .eq("field_id", fieldId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Update field
export async function updateField(
  fieldId: string,
  updates: Partial<{
    name: string
    description: string
    address: string
    hourly_rate: number
    capacity: number
    amenities: string[]
    images: string[]
  }>,
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("fields")
      .update(updates)
      .eq("id", fieldId)
      .eq("owner_id", user.id) // Ensure only owner can update
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get owner's fields
export async function getOwnerFields() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("fields")
      .select(`
        *,
        matches:matches(id, title, match_date, status),
        ratings:field_ratings(rating)
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Frontend usage examples:
/*
// Create field
const field = await createField({
  name: 'Merkez Stadyum',
  address: 'İstanbul, Türkiye',
  hourly_rate: 200,
  capacity: 22,
  amenities: ['parking', 'shower', 'lighting']
})

// Get all fields with filters
const fields = await getFields({
  min_rating: 4,
  max_hourly_rate: 300,
  amenities: ['parking'],
  search: 'stadyum'
})

// Get field details
const fieldDetails = await getFieldDetails('field-uuid')

// Rate field
const rating = await rateField('field-uuid', 5, 'Great field!', 'match-uuid')

// Get field ratings
const ratings = await getFieldRatings('field-uuid')

// Update field (owner only)
const updated = await updateField('field-uuid', {
  hourly_rate: 250,
  amenities: ['parking', 'shower', 'lighting', 'cafe']
})

// Get owner's fields
const ownerFields = await getOwnerFields()

// Usage in React component:
import { getFields, rateField } from '@/lib/api/fields'

const FieldsPage = () => {
  const [fields, setFields] = useState([])
  
  useEffect(() => {
    const loadFields = async () => {
      const { data, error } = await getFields({ min_rating: 4 })
      if (data) setFields(data)
    }
    loadFields()
  }, [])
  
  const handleRateField = async (fieldId, rating, comment) => {
    const { data, error } = await rateField(fieldId, rating, comment)
    if (data) {
      alert('Değerlendirme kaydedildi!')
    }
  }
  
  return (
    // JSX here
  )
}
*/
