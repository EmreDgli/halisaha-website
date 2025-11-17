"use client"

import { supabase } from "../supabase"

// Bildirim oluştur
export async function createNotification(data: {
  user_id: string
  title: string
  message: string
  type: "team_join" | "match_invite" | "general"
  related_id?: string
}) {
  try {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type,
        related_id: data.related_id,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error
    return { data: notification, error: null }
  } catch (error) {
    console.error("createNotification error:", error)
    return { data: null, error }
  }
}

// Kullanıcının bildirimlerini getir
export async function getUserNotifications() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("getUserNotifications error:", error)
    return { data: null, error }
  }
}

// Bildirimi okundu olarak işaretle
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("markNotificationAsRead error:", error)
    return { data: null, error }
  }
}

// Okunmamış bildirim sayısını getir
export async function getUnreadNotificationCount() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) throw error
    return { data: count, error: null }
  } catch (error) {
    console.error("getUnreadNotificationCount error:", error)
    return { data: null, error }
  }
}

// Subscribe to real-time notifications
export function subscribeToNotifications(userId: string, callback: (notification: any) => void) {
  const subscription = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe()

  return subscription
}

// Frontend usage examples:
/*
// Get notifications
const notifications = await getUserNotifications()

// Mark as read
const result = await markNotificationAsRead('notification-uuid')

// Mark all as read
const allRead = await markAllNotificationsAsRead()

// Delete notification
const deleted = await deleteNotification('notification-uuid')

// Get unread count
const { count } = await getUnreadNotificationCount()

// Subscribe to real-time notifications
const subscription = subscribeToNotifications(userId, (notification) => {
  console.log('New notification:', notification)
  // Update UI with new notification
})

// Usage in React component:
import { getUserNotifications, markNotificationAsRead, subscribeToNotifications } from '@/lib/api/notifications'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    const loadNotifications = async () => {
      const { data, error } = await getUserNotifications()
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }
    
    loadNotifications()
    
    // Subscribe to real-time updates
    const subscription = subscribeToNotifications(userId, (payload) => {
      setNotifications(prev => [payload.new, ...prev])
      setUnreadCount(prev => prev + 1)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const handleMarkAsRead = async (notificationId) => {
    const { data, error } = await markNotificationAsRead(notificationId)
    if (data) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => prev - 1)
    }
  }
  
  return (
    // JSX here
  )
}
*/
