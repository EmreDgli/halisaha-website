"use client"

import { supabase } from "../supabase"
import { createNotification } from "./notifications"

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

    // Enhance teams with additional data
    if (data) {
      const enhancedTeams = await Promise.all(
        data.map(async (team) => {
          // Get current participant count
          const currentMembers = team.members?.length || 0
          
          // Get team statistics
          const statsResult = await getTeamStats(team.id)
          const stats = statsResult.data
          
          return {
            ...team,
            currentMembers,
            maxPlayers: team.max_players || 11,
            availableSlots: Math.max(0, (team.max_players || 11) - currentMembers),
            isFull: currentMembers >= (team.max_players || 11),
            // Team statistics
            totalMatches: stats?.totalMatches || 0,
            wins: stats?.wins || 0,
            draws: stats?.draws || 0,
            losses: stats?.losses || 0,
            winRate: stats?.winRate || 0,
            upcomingMatches: stats?.upcomingMatches || 0,
            // Recent activity (last 3 matches)
            recentMatches: stats?.recentMatches?.slice(0, 3) || [],
            // Last active calculation
            lastActive: team.updated_at ? 
              new Date(team.updated_at).toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'short' 
              }) : 'Yakın zamanda'
          }
        })
      )
      
      return { data: enhancedTeams, error: null }
    }

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
  try {
    console.log("handleTeamJoinRequest - Starting:", { requestId, approve })
    
    // 1. Join request'i bul
    const { data: joinRequest, error: fetchError } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        team:teams(name, manager_id),
        user:users(full_name, email)
      `)
      .eq('id', requestId)
      .single()
    
    if (fetchError || !joinRequest) {
      console.error("handleTeamJoinRequest - Fetch error:", fetchError)
      return { error: fetchError || 'Join request not found' }
    }

    console.log("handleTeamJoinRequest - Join request found:", joinRequest)

    const status = approve ? 'approved' : 'rejected'

    // 2. Onaylanırsa kullanıcıyı takıma ekle
    if (approve) {
      console.log("handleTeamJoinRequest - Adding user to team")
      
      // Kullanıcıyı team_members tablosuna ekle
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: joinRequest.team_id,
          user_id: joinRequest.user_id,
          joined_at: new Date().toISOString(),
        })

      if (memberError) {
        console.error("handleTeamJoinRequest - Member insert error:", memberError)
        return { error: memberError }
      }

      // 3. Takım üye sayısını güncelle
      console.log("handleTeamJoinRequest - Updating team member count")
      const { data: memberCount, error: countError } = await supabase
        .from('team_members')
        .select('id', { count: 'exact' })
        .eq('team_id', joinRequest.team_id)

      if (!countError && memberCount) {
        await supabase
          .from('teams')
          .update({ member_count: memberCount.length })
          .eq('id', joinRequest.team_id)
      }

      // 4. Kullanıcıya bildirim gönder
      console.log("handleTeamJoinRequest - Sending notification to user")
      await createNotification({
        user_id: joinRequest.user_id,
        title: "Takım Katılım İsteği Onaylandı",
        message: `${joinRequest.team.name} takımına katılım isteğiniz onaylandı! Artık takım üyesi olarak görünüyorsunuz.`,
        type: "team_join",
        related_id: joinRequest.team_id,
      })

      console.log("handleTeamJoinRequest - User successfully added to team")
    } else {
      // 5. Reddedilirse kullanıcıya bildirim gönder
      console.log("handleTeamJoinRequest - Sending rejection notification")
      await createNotification({
        user_id: joinRequest.user_id,
        title: "Takım Katılım İsteği Reddedildi",
        message: `${joinRequest.team.name} takımına katılım isteğiniz reddedildi.`,
        type: "team_join",
        related_id: joinRequest.team_id,
      })
    }

    // 6. Join request status'unu güncelle
    console.log("handleTeamJoinRequest - Updating request status")
    const { data: updatedRequest, error: updateError } = await supabase
      .from('team_join_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error("handleTeamJoinRequest - Status update error:", updateError)
      return { error: updateError }
    }

    console.log("handleTeamJoinRequest - Successfully completed")
    return { data: updatedRequest, error: null }
  } catch (error) {
    console.error("handleTeamJoinRequest - Unexpected error:", error)
    return { data: null, error }
  }
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

// Get team statistics
export async function getTeamStats(teamId: string) {
  try {
    // Get team matches
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        status,
        match_date,
        organizer_score,
        opponent_score,
        organizer_team_id,
        opponent_team_id
      `)
      .or(`organizer_team_id.eq.${teamId},opponent_team_id.eq.${teamId}`)
      .order("match_date", { ascending: false })

    if (matchesError) throw matchesError

    // Calculate statistics
    const totalMatches = matches?.length || 0
    const wins = matches?.filter(match => {
      if (match.status === 'completed') {
        if (match.organizer_team_id === teamId) {
          return match.organizer_score > match.opponent_score
        } else {
          return match.opponent_score > match.organizer_score
        }
      }
      return false
    }).length || 0

    const draws = matches?.filter(match => {
      if (match.status === 'completed') {
        return match.organizer_score === match.opponent_score
      }
      return false
    }).length || 0

    const losses = totalMatches - wins - draws
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

    // Get recent activity (last 5 matches)
    const recentMatches = matches?.slice(0, 5) || []

    // Get upcoming matches
    const upcomingMatches = matches?.filter(match => 
      match.status === 'pending' && new Date(match.match_date) > new Date()
    ).length || 0

    return {
      data: {
        totalMatches,
        wins,
        draws,
        losses,
        winRate,
        recentMatches,
        upcomingMatches
      },
      error: null
    }
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
