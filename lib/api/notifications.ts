"use client"

import { supabase } from "../supabase"

// Get user notifications
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
    return { data: null, error }
  }
}

// Mark notification as read
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
    return { data: null, error }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", user.id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Get unread notification count
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

    return { count: count || 0, error: null }
  } catch (error) {
    return { count: 0, error }
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
