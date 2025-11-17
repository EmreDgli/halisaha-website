"use client"

import { supabase } from "../supabase"

// Kullanıcıları etiket ile ara
export async function searchUserByTag(tag: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, avatar_url, tag, roles")
      .eq("tag", tag)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcıları isim ile ara
export async function searchUsersByName(name: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, avatar_url, tag, roles")
      .ilike("full_name", `%${name}%`)
      .limit(10)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcıları etiket ile ara (kısmi eşleşme)
export async function searchUsersByTagPartial(tag: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, avatar_url, tag, roles")
      .ilike("tag", `%${tag}%`)
      .limit(10)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Oyuncu arama için gelişmiş kullanıcı bilgileri
export async function searchPlayersForTeams(filters?: {
  position?: string
  skillLevel?: string
  city?: string
  availability?: string
}) {
  try {
    let query = supabase
      .from("users")
      .select(`
        id,
        full_name,
        avatar_url,
        tag,
        roles,
        phone,
        profiles(
          position,
          skill_level,
          preferred_city,
          availability,
          experience_years,
          preferred_time
        )
      `)
      .eq("roles", "player")
      .limit(100)

    // Filtreleri uygula
    if (filters?.position) {
      query = query.eq("profiles.position", filters.position)
    }
    if (filters?.skillLevel) {
      query = query.eq("profiles.skill_level", filters.skillLevel)
    }
    if (filters?.city) {
      query = query.ilike("profiles.preferred_city", `%${filters.city}%`)
    }
    if (filters?.availability) {
      query = query.eq("profiles.availability", filters.availability)
    }

    const { data, error } = await query

    if (error) throw error

    // Oyuncu istatistiklerini getir
    if (data) {
      const playersWithStats = await Promise.all(
        data.map(async (player) => {
          // Maç istatistiklerini getir
          const { data: matches } = await supabase
            .from("matches")
            .select("id, result, created_at")
            .or(`team1_members.cs.{${player.id}},team2_members.cs.{${player.id}}`)
            .order("created_at", { ascending: false })
            .limit(10)

          // Takım üyeliklerini getir
          const { data: teamMemberships } = await supabase
            .from("team_members")
            .select("team_id, teams(name)")
            .eq("user_id", player.id)

          // İstatistikleri hesapla
          const totalMatches = matches?.length || 0
          const wins = matches?.filter(m => m.result === "win").length || 0
          const draws = matches?.filter(m => m.result === "draw").length || 0
          const losses = matches?.filter(m => m.result === "loss").length || 0
          const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

          return {
            ...player,
            profiles: player.profiles || {
              position: 'Belirtilmemiş',
              skill_level: 'Belirtilmemiş',
              preferred_city: 'Belirtilmemiş',
              availability: 'Belirtilmemiş',
              experience_years: 0,
              preferred_time: 'Belirtilmemiş'
            },
            stats: {
              totalMatches,
              wins,
              draws,
              losses,
              winRate
            },
            teamMemberships: teamMemberships?.map(tm => tm.teams?.name).filter(Boolean) || [],
            lastActive: matches?.[0]?.created_at ? 
              new Date(matches[0].created_at).toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'short' 
              }) : 'Yakın zamanda'
          }
        })
      )

      return { data: playersWithStats, error: null }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcıyı ID ile getir
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, avatar_url, tag, roles, phone")
      .eq("id", userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcı etiketinin benzersiz olup olmadığını kontrol et
export async function isTagUnique(tag: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("tag", tag)
      .single()

    if (error && error.code === 'PGRST116') {
      // Kullanıcı bulunamadı, etiket benzersiz
      return { isUnique: true, error: null }
    }

    if (error) throw error

    // Kullanıcı bulundu, etiket benzersiz değil
    return { isUnique: false, error: null }
  } catch (error) {
    return { isUnique: false, error }
  }
}

// Kullanıcı etiketini güncelle
export async function updateUserTag(userId: string, newTag: string) {
  try {
    // Önce etiketin benzersiz olup olmadığını kontrol et
    const { isUnique } = await isTagUnique(newTag)
    
    if (!isUnique) {
      throw new Error("Bu etiket zaten kullanılıyor")
    }

    const { data, error } = await supabase
      .from("users")
      .update({ tag: newTag })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcı profilini güncelle
export async function updateUserProfile(userId: string, updates: {
  full_name?: string
  phone?: string
  avatar_url?: string
  tag?: string
}) {
  try {
    // Eğer tag güncelleniyorsa benzersizlik kontrolü yap
    if (updates.tag) {
      const { isUnique } = await isTagUnique(updates.tag)
      if (!isUnique) {
        throw new Error("Bu etiket zaten kullanılıyor")
      }
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcı arama (genel arama - isim veya etiket)
export async function searchUsers(query: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, avatar_url, tag, roles")
      .or(`full_name.ilike.%${query}%,tag.ilike.%${query}%`)
      .limit(10)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcıları takıma davet et
export async function inviteUserToTeam(userId: string, teamId: string, message?: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Önce kullanıcının bu takıma zaten üye olup olmadığını kontrol et
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single()

    if (existingMember) {
      throw new Error("Kullanıcı zaten takımın üyesi")
    }

    // Davet oluştur
    const { data, error } = await supabase
      .from("team_invites")
      .insert({
        team_id: teamId,
        invited_user_id: userId,
        invited_by: user.id,
        message: message || "Takımımıza katılmanızı istiyoruz!",
        status: "pending"
      })
      .select()
      .single()

    if (error) throw error

    // Bildirim oluştur
    const { data: team } = await supabase
      .from("teams")
      .select("name, manager:users(full_name)")
      .eq("id", teamId)
      .single()

    if (team) {
      await supabase.rpc("create_notification", {
        p_user_id: userId,
        p_title: "Takım Daveti",
        p_message: `${team.manager.full_name} sizi ${team.name} takımına davet ediyor`,
        p_type: "team_invite",
        p_related_id: data.id,
      })
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Kullanıcının davetlerini getir
export async function getUserInvites() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("team_invites")
      .select(`
        *,
        team:teams(name, city, district),
        invited_by_user:users!team_invites_invited_by_fkey(full_name, avatar_url)
      `)
      .eq("invited_user_id", user.id)
      .eq("status", "pending")

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Daveti kabul et veya reddet
export async function handleTeamInvite(inviteId: string, accept: boolean) {
  try {
    const status = accept ? "accepted" : "rejected"
    
    // Daveti güncelle
    const { data: invite, error: updateError } = await supabase
      .from("team_invites")
      .update({ status })
      .eq("id", inviteId)
      .select()
      .single()

    if (updateError) throw updateError

    // Eğer kabul edildiyse takıma ekle
    if (accept && invite) {
      await supabase.from("team_members").insert({
        team_id: invite.team_id,
        user_id: invite.invited_user_id,
      })
    }

    return { data: invite, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Takıma davet gönder (oyuncu arama sayfası için)
export async function sendTeamInvite(userId: string, teamId: string, message?: string) {
  try {
    const result = await inviteUserToTeam(userId, teamId, message)
    return result
  } catch (error) {
    return { data: null, error }
  }
} 