"use client"

import { supabase } from "../supabase"

// Create new match
export async function createMatch(matchData: {
  title: string
  description?: string
  field_id: string
  organizer_team_id: string
  match_date: string
  duration_minutes?: number
  max_players_per_team?: number
  entry_fee?: number
}) {
  try {
    const { data, error } = await supabase
      .from("matches")
      .insert({
        ...matchData,
        duration_minutes: matchData.duration_minutes || 90,
        max_players_per_team: matchData.max_players_per_team || 11,
        entry_fee: matchData.entry_fee || 0,
      })
      .select(`
        *,
        field:fields(name, address, hourly_rate),
        organizer_team:teams!matches_organizer_team_id_fkey(name, manager_id)
      `)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get available matches (pending status)
export async function getAvailableMatches(filters?: {
  city?: string
  date_from?: string
  date_to?: string
  max_entry_fee?: number
}) {
  try {
    let query = supabase
      .from("matches")
      .select(`
        *,
        field:fields(name, address, rating, city),
        organizer_team:teams!matches_organizer_team_id_fkey(name, city),
        opponent_team:teams!matches_opponent_team_id_fkey(name)
      `)
      .eq("status", "pending")
      .gte("match_date", new Date().toISOString())

    if (filters?.date_from) {
      query = query.gte("match_date", filters.date_from)
    }

    if (filters?.date_to) {
      query = query.lte("match_date", filters.date_to)
    }

    if (filters?.max_entry_fee) {
      query = query.lte("entry_fee", filters.max_entry_fee)
    }

    const { data, error } = await query.order("match_date", { ascending: true })

    if (error) throw error

    // Filter by city if provided (since field city is in nested object)
    let filteredData = data
    if (filters?.city) {
      filteredData = data?.filter((match) => match.field?.city === filters.city) || []
    }

    return { data: filteredData, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get match details
export async function getMatchDetails(matchId: string) {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        field:fields(name, address, rating, hourly_rate, owner_id),
        organizer_team:teams!matches_organizer_team_id_fkey(
          id, name, manager_id,
          members:team_members(
            user:users(id, full_name, avatar_url)
          )
        ),
        opponent_team:teams!matches_opponent_team_id_fkey(
          id, name, manager_id,
          members:team_members(
            user:users(id, full_name, avatar_url)
          )
        ),
        participants:match_participants(
          user:users(full_name, avatar_url),
          team_side, position, goals, assists
        )
      `)
      .eq("id", matchId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Request to join match
export async function requestToJoinMatch(matchId: string, teamId: string, message?: string) {
  try {
    const { data, error } = await supabase
      .from("match_join_requests")
      .insert({
        match_id: matchId,
        team_id: teamId,
        message,
      })
      .select()
      .single()

    if (error) throw error

    // Notify match organizer
    const { data: match } = await supabase
      .from("matches")
      .select(`
        title,
        organizer_team:teams!matches_organizer_team_id_fkey(manager_id)
      `)
      .eq("id", matchId)
      .single()

    if (match) {
      await supabase.rpc("create_notification", {
        p_user_id: match.organizer_team.manager_id,
        p_title: "Yeni Maç Katılım İsteği",
        p_message: `${match.title} maçına katılım isteği var`,
        p_type: "match_join_request",
        p_related_id: data.id,
      })
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Approve match join request
export async function approveMatchJoinRequest(requestId: string) {
  try {
    const { data, error } = await supabase
      .from("match_join_requests")
      .update({ status: "approved" })
      .eq("id", requestId)
      .select(`
        *,
        match:matches(id, title),
        team:teams(name, manager_id)
      `)
      .single()

    if (error) throw error

    // Update match with opponent team
    await supabase
      .from("matches")
      .update({
        opponent_team_id: data.team_id,
        status: "confirmed",
      })
      .eq("id", data.match_id)

    // Notify team manager
    await supabase.rpc("create_notification", {
      p_user_id: data.team.manager_id,
      p_title: "Maç Katılım İsteği Onaylandı",
      p_message: `${data.match.title} maçına katılım isteğiniz onaylandı`,
      p_type: "match_join_approved",
    })

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Update match result and statistics
export async function updateMatchResult(
  matchId: string,
  organizerScore: number,
  opponentScore: number,
  statistics?: Array<{
    user_id: string
    goals: number
    assists: number
    yellow_cards: number
    red_cards: number
    minutes_played: number
  }>,
) {
  try {
    // Update match result
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .update({
        organizer_score: organizerScore,
        opponent_score: opponentScore,
        status: "completed",
      })
      .eq("id", matchId)
      .select()
      .single()

    if (matchError) throw matchError

    // Insert match statistics if provided
    if (statistics && statistics.length > 0) {
      const statsWithMatchId = statistics.map((stat) => ({
        ...stat,
        match_id: matchId,
      }))

      const { error: statsError } = await supabase.from("match_statistics").insert(statsWithMatchId)

      if (statsError) throw statsError
    }

    return { data: matchData, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get user's matches (as organizer or opponent)
export async function getUserMatches() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Get user's teams first
    const { data: userTeams } = await supabase
      .from("teams")
      .select("id")
      .or(
        `manager_id.eq.${user.id},id.in.(${
          // Get teams where user is a member
          await supabase
            .from("team_members")
            .select("team_id")
            .eq("user_id", user.id)
            .then(({ data }) => data?.map((tm) => tm.team_id).join(",") || "")
        })`,
      )

    if (!userTeams || userTeams.length === 0) {
      return { data: [], error: null }
    }

    const teamIds = userTeams.map((t) => t.id)

    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        field:fields(name, address),
        organizer_team:teams!matches_organizer_team_id_fkey(name),
        opponent_team:teams!matches_opponent_team_id_fkey(name)
      `)
      .or(`organizer_team_id.in.(${teamIds.join(",")}),opponent_team_id.in.(${teamIds.join(",")})`)
      .order("match_date", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Frontend usage examples:
/*
// Create match
const match = await createMatch({
  title: 'Friendly Match',
  field_id: 'field-uuid',
  organizer_team_id: 'team-uuid',
  match_date: '2024-01-15T15:00:00Z',
  entry_fee: 50
})

// Get available matches with filters
const matches = await getAvailableMatches({
  city: 'İstanbul',
  date_from: '2024-01-01',
  max_entry_fee: 100
})

// Get match details
const matchDetails = await getMatchDetails('match-uuid')

// Request to join match
const request = await requestToJoinMatch('match-uuid', 'team-uuid', 'We want to play!')

// Approve request (match organizer only)
const approved = await approveMatchJoinRequest('request-uuid')

// Update match result with statistics
const result = await updateMatchResult('match-uuid', 2, 1, [
  {
    user_id: 'user-uuid',
    goals: 2,
    assists: 1,
    yellow_cards: 0,
    red_cards: 0,
    minutes_played: 90
  }
])

// Get user matches
const userMatches = await getUserMatches()

// Usage in React component:
import { createMatch, getAvailableMatches, requestToJoinMatch } from '@/lib/api/matches'

const MatchesPage = () => {
  const [matches, setMatches] = useState([])
  
  useEffect(() => {
    const loadMatches = async () => {
      const { data, error } = await getAvailableMatches({ city: 'İstanbul' })
      if (data) setMatches(data)
    }
    loadMatches()
  }, [])
  
  const handleJoinMatch = async (matchId, teamId) => {
    const { data, error } = await requestToJoinMatch(matchId, teamId, 'Maça katılmak istiyoruz')
    if (data) {
      alert('Katılım isteği gönderildi!')
    }
  }
  
  return (
    // JSX here
  )
}
*/
