"use client"

import { supabase } from "../supabase"

// Upload match video
export async function uploadMatchVideo(
  file: File,
  matchId: string,
  title: string,
  description?: string,
  isPublic = true,
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Upload video file
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("match-videos").upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("match-videos").getPublicUrl(fileName)

    // Save video metadata
    const { data, error } = await supabase
      .from("match_videos")
      .insert({
        match_id: matchId,
        uploader_id: user.id,
        title,
        description,
        video_url: publicUrl,
        is_public: isPublic,
        duration_seconds: 0, // Would be calculated from video metadata
      })
      .select(`
        *,
        uploader:users(full_name, avatar_url),
        match:matches(title, match_date)
      `)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get match videos
export async function getMatchVideos(matchId: string) {
  try {
    const { data, error } = await supabase
      .from("match_videos")
      .select(`
        *,
        uploader:users(full_name, avatar_url),
        match:matches(title, match_date)
      `)
      .eq("match_id", matchId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get all public videos with filters
export async function getPublicVideos(filters?: {
  search?: string
  uploader_id?: string
  limit?: number
}) {
  try {
    let query = supabase
      .from("match_videos")
      .select(`
        *,
        uploader:users(full_name, avatar_url),
        match:matches(
          title, match_date,
          organizer_team:teams!matches_organizer_team_id_fkey(name),
          opponent_team:teams!matches_opponent_team_id_fkey(name)
        )
      `)
      .eq("is_public", true)

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.uploader_id) {
      query = query.eq("uploader_id", filters.uploader_id)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get video details
export async function getVideoDetails(videoId: string) {
  try {
    const { data, error } = await supabase
      .from("match_videos")
      .select(`
        *,
        uploader:users(full_name, avatar_url),
        match:matches(
          title, match_date, organizer_score, opponent_score,
          field:fields(name, address),
          organizer_team:teams!matches_organizer_team_id_fkey(name),
          opponent_team:teams!matches_opponent_team_id_fkey(name)
        )
      `)
      .eq("id", videoId)
      .single()

    if (error) throw error

    // Increment view count
    await supabase.rpc("increment_video_views", { p_video_id: videoId })

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Update video
export async function updateVideo(
  videoId: string,
  updates: Partial<{
    title: string
    description: string
    is_public: boolean
  }>,
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("match_videos")
      .update(updates)
      .eq("id", videoId)
      .eq("uploader_id", user.id) // Ensure only uploader can update
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Delete video
export async function deleteVideo(videoId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Get video details first to delete file
    const { data: video } = await supabase
      .from("match_videos")
      .select("video_url, uploader_id")
      .eq("id", videoId)
      .single()

    if (!video || video.uploader_id !== user.id) {
      throw new Error("Unauthorized")
    }

    // Extract file path from URL
    const urlParts = video.video_url.split("/")
    const fileName = urlParts.slice(-2).join("/") // user_id/filename

    // Delete file from storage
    await supabase.storage.from("match-videos").remove([fileName])

    // Delete video record
    const { error } = await supabase.from("match_videos").delete().eq("id", videoId).eq("uploader_id", user.id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Get user's uploaded videos
export async function getUserVideos() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("match_videos")
      .select(`
        *,
        match:matches(
          title, match_date,
          organizer_team:teams!matches_organizer_team_id_fkey(name),
          opponent_team:teams!matches_opponent_team_id_fkey(name)
        )
      `)
      .eq("uploader_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Frontend usage examples:
/*
// Upload video
const video = await uploadMatchVideo(videoFile, 'match-uuid', 'Match Highlights', 'Great goals!', true)

// Get match videos
const videos = await getMatchVideos('match-uuid')

// Get all public videos
const publicVideos = await getPublicVideos({ search: 'final', limit: 10 })

// Get video details
const videoDetails = await getVideoDetails('video-uuid')

// Update video
const updated = await updateVideo('video-uuid', { title: 'New Title', is_public: false })

// Delete video
const deleted = await deleteVideo('video-uuid')

// Get user's videos
const userVideos = await getUserVideos()

// Usage in React component:
import { uploadMatchVideo, getPublicVideos } from '@/lib/api/videos'

const VideosPage = () => {
  const [videos, setVideos] = useState([])
  
  useEffect(() => {
    const loadVideos = async () => {
      const { data, error } = await getPublicVideos({ limit: 20 })
      if (data) setVideos(data)
    }
    loadVideos()
  }, [])
  
  const handleUpload = async (file, matchId, title) => {
    const { data, error } = await uploadMatchVideo(file, matchId, title)
    if (data) {
      alert('Video yüklendi!')
    }
  }
  
  return (
    // JSX here
  )
}
*/
