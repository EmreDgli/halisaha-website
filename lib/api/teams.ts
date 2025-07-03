"use client"

import { supabase } from "../supabase"

// Create new team
export async function createTeam(teamData: {
  name: string
  description?: string
  city?: string
  district?: string
  skill_level?: string
  max_players?: number
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("[createTeam] user:", user)
    if (!user) throw new Error("User not authenticated")
    const { data, error } = await supabase
      .from("teams")
      .insert({
        ...teamData,
        manager_id: user.id,
        max_players: teamData.max_players || 11,
      })
      .select()
      .single()
    console.log("[createTeam] insert error:", error)
    if (error) throw error

    // Kurucu kullanıcıyı team_members tablosuna da ekle
    await supabase.from("team_members").insert({
      team_id: data.id,
      user_id: user.id,
    })

    return { data, error: null }
  } catch (error) {
    console.error("[createTeam] catch error:", error)
    return { data: null, error }
  }
}

// Get all teams with filters
export async function getTeams(filters?: {
  city?: string
  skill_level?: string
  search?: string
}) {
  try {
    let query = supabase.from("teams").select(`
        *,
        manager:users!teams_manager_id_fkey(full_name, avatar_url),
        members:team_members(
          id,
          position,
          jersey_number,
          user:users(full_name, avatar_url)
        )
      `)

    if (filters?.city) {
      query = query.eq("city", filters.city)
    }

    if (filters?.skill_level) {
      query = query.eq("skill_level", filters.skill_level)
    }

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get user's teams
export async function getUserTeams() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase.rpc("get_user_teams", {
      p_user_id: user.id,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Join team request
export async function requestToJoinTeam(teamId: string, message?: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("team_join_requests")
      .insert({
        team_id: teamId,
        user_id: user.id,
        message,
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for team manager
    const { data: team } = await supabase.from("teams").select("manager_id, name").eq("id", teamId).single()

    if (team) {
      await supabase.rpc("create_notification", {
        p_user_id: team.manager_id,
        p_title: "Yeni Takım Katılım İsteği",
        p_message: `${team.name} takımına katılım isteği var`,
        p_type: "team_join_request",
        p_related_id: data.id,
      })
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Approve/reject team join request
export async function handleTeamJoinRequest(requestId: string, approve: boolean) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const status = approve ? "approved" : "rejected"

    const { data, error } = await supabase
      .from("team_join_requests")
      .update({ status })
      .eq("id", requestId)
      .select(`
        *,
        team:teams(name),
        user:users(full_name)
      `)
      .single()

    if (error) throw error

    // If approved, add user to team
    if (approve) {
      await supabase.from("team_members").insert({
        team_id: data.team_id,
        user_id: data.user_id,
      })
    }

    // Notify the requester
    await supabase.rpc("create_notification", {
      p_user_id: data.user_id,
      p_title: approve ? "Takım Katılım İsteği Onaylandı" : "Takım Katılım İsteği Reddedildi",
      p_message: `${data.team.name} takımına katılım isteğiniz ${approve ? "onaylandı" : "reddedildi"}`,
      p_type: "team_join_response",
    })

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get team details
export async function getTeamDetails(teamId: string) {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        *,
        manager:users!teams_manager_id_fkey(full_name, avatar_url, phone),
        members:team_members(
          id,
          position,
          jersey_number,
          joined_at,
          user:users(id, full_name, avatar_url)
        )
      `)
      .eq("id", teamId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Frontend usage examples:
/*
// Create team
const team = await createTeam({
  name: 'FC Barcelona',
  description: 'Professional football team',
  city: 'İstanbul',
  district: 'Kadıköy',
  skill_level: 'İleri'
})

// Get all teams with filters
const teams = await getTeams({
  city: 'İstanbul',
  skill_level: 'Orta',
  search: 'Barcelona'
})

// Get user teams
const userTeams = await getUserTeams()

// Request to join team
const request = await requestToJoinTeam('team-uuid', 'I want to join your team')

// Approve join request (team manager only)
const result = await handleTeamJoinRequest('request-uuid', true)

// Get team details
const teamDetails = await getTeamDetails('team-uuid')

// Usage in React component:
import { createTeam, getTeams, requestToJoinTeam } from '@/lib/api/teams'

const TeamsPage = () => {
  const [teams, setTeams] = useState([])
  
  useEffect(() => {
    const loadTeams = async () => {
      const { data, error } = await getTeams({ city: 'İstanbul' })
      if (data) setTeams(data)
    }
    loadTeams()
  }, [])
  
  const handleJoinTeam = async (teamId) => {
    const { data, error } = await requestToJoinTeam(teamId, 'Takımınıza katılmak istiyorum')
    if (data) {
      alert('Katılım isteği gönderildi!')
    }
  }
  
  return (
    // JSX here
  )
}
*/
