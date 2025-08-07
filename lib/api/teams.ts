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

// Takıma gelen katılma isteklerini getir
export async function getTeamJoinRequests(teamId: string) {
  return await supabase
    .from('team_join_requests')
    .select('*, user:users(full_name, avatar_url)')
    .eq('team_id', teamId)
    .eq('status', 'pending');
}

// Kullanıcının yönettiği takımlara gelen tüm pending katılma istekleri
export async function getJoinRequestsForManager() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Önce kullanıcının manager olduğu takımları çek
  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .eq('manager_id', user.id);

  const teamIds = teams?.map((t: any) => t.id) || [];
  if (teamIds.length === 0) return { data: [], error: null };

  // Sonra bu takımlara gelen pending join requestleri çek
  const { data, error } = await supabase
    .from('team_join_requests')
    .select('*, user:users(full_name, avatar_url), team:teams(name)')
    .in('team_id', teamIds)
    .eq('status', 'pending');

  return { data, error };
}

// Katılma isteğini onayla veya reddet
export async function handleTeamJoinRequest(requestId: string, approve: boolean) {
  const status = approve ? 'approved' : 'rejected';
  // Önce join requesti bul
  const { data: joinRequest, error: fetchError } = await supabase
    .from('team_join_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  if (fetchError || !joinRequest) return { error: fetchError || 'Join request not found' };

  // Onaylanırsa üyeler tablosuna ekle
    if (approve) {
    await supabase.from('team_members').insert({
      team_id: joinRequest.team_id,
      user_id: joinRequest.user_id,
    });
  }
  // Status'u güncelle
  return await supabase
    .from('team_join_requests')
    .update({ status })
    .eq('id', requestId);
}

// Takımı ve üyeliklerini sil
export async function deleteTeam(teamId: string) {
  // Önce üyelikleri sil
  await supabase.from('team_members').delete().eq('team_id', teamId);
  // Sonra takımı sil
  return await supabase.from('teams').delete().eq('id', teamId);
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
