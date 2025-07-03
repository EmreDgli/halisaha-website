"use client"

// Complete example of how to use all API functions in a React application

import { useState, useEffect } from "react"
import { registerUser, loginUser, getCurrentUserProfile } from "./auth"
import { createTeam, getTeams, requestToJoinTeam, getUserTeams } from "./teams"
import { createMatch, getAvailableMatches, requestToJoinMatch, getUserMatches } from "./matches"
import { createPayment, getUserPayments } from "./payments"
import { getUserNotifications, markNotificationAsRead, subscribeToNotifications } from "./notifications"

// Example: Complete user registration and login flow
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await getCurrentUserProfile()
      if (data) setUser(data)
      setLoading(false)
    }
    loadUser()
  }, [])

  const register = async (userData: {
    email: string
    password: string
    fullName: string
    roles: string[]
    phone?: string
  }) => {
    const { data, error } = await registerUser(
      userData.email,
      userData.password,
      userData.fullName,
      userData.roles,
      userData.phone,
    )

    if (data) {
      // Registration successful, user needs to verify email
      return { success: true, message: "Kayıt başarılı! Email adresinizi kontrol edin." }
    } else {
      return { success: false, message: error?.message || "Kayıt başarısız" }
    }
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await loginUser(email, password)

    if (data?.user) {
      const { data: profile } = await getCurrentUserProfile()
      setUser(profile)
      return { success: true }
    } else {
      return { success: false, message: error?.message || "Giriş başarısız" }
    }
  }

  return { user, loading, register, login }
}

// Example: Team management
export const useTeams = () => {
  const [teams, setTeams] = useState([])
  const [userTeams, setUserTeams] = useState([])

  const loadTeams = async (filters?: any) => {
    const { data, error } = await getTeams(filters)
    if (data) setTeams(data)
  }

  const loadUserTeams = async () => {
    const { data, error } = await getUserTeams()
    if (data) setUserTeams(data)
  }

  const createNewTeam = async (teamData: any) => {
    const { data, error } = await createTeam(teamData)
    if (data) {
      await loadUserTeams() // Refresh user teams
      return { success: true, team: data }
    }
    return { success: false, error }
  }

  const joinTeam = async (teamId: string, message?: string) => {
    const { data, error } = await requestToJoinTeam(teamId, message)
    if (data) {
      return { success: true, message: "Katılım isteği gönderildi!" }
    }
    return { success: false, error }
  }

  return {
    teams,
    userTeams,
    loadTeams,
    loadUserTeams,
    createNewTeam,
    joinTeam,
  }
}

// Example: Match management
export const useMatches = () => {
  const [availableMatches, setAvailableMatches] = useState([])
  const [userMatches, setUserMatches] = useState([])

  const loadAvailableMatches = async (filters?: any) => {
    const { data, error } = await getAvailableMatches(filters)
    if (data) setAvailableMatches(data)
  }

  const loadUserMatches = async () => {
    const { data, error } = await getUserMatches()
    if (data) setUserMatches(data)
  }

  const createNewMatch = async (matchData: any) => {
    const { data, error } = await createMatch(matchData)
    if (data) {
      await loadUserMatches() // Refresh user matches
      return { success: true, match: data }
    }
    return { success: false, error }
  }

  const joinMatch = async (matchId: string, teamId: string, message?: string) => {
    const { data, error } = await requestToJoinMatch(matchId, teamId, message)
    if (data) {
      return { success: true, message: "Maç katılım isteği gönderildi!" }
    }
    return { success: false, error }
  }

  return {
    availableMatches,
    userMatches,
    loadAvailableMatches,
    loadUserMatches,
    createNewMatch,
    joinMatch,
  }
}

// Example: Payment processing
export const usePayments = () => {
  const [payments, setPayments] = useState([])

  const loadPayments = async () => {
    const { data, error } = await getUserPayments()
    if (data) setPayments(data)
  }

  const processPayment = async (paymentData: {
    match_id?: string
    amount: number
    payment_method: string
  }) => {
    const { data, error, success } = await createPayment(paymentData)

    if (success) {
      await loadPayments() // Refresh payments
      return { success: true, payment: data }
    } else {
      return { success: false, error }
    }
  }

  return {
    payments,
    loadPayments,
    processPayment,
  }
}

// Example: Notifications with real-time updates
export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadNotifications = async () => {
      const { data, error } = await getUserNotifications()
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      }
    }

    loadNotifications()

    // Subscribe to real-time notifications
    const subscription = subscribeToNotifications(userId, (payload) => {
      setNotifications((prev) => [payload.new, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    const { data, error } = await markNotificationAsRead(notificationId)
    if (data) {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
  }
}

// Example: Complete app component using all hooks
export const FootballApp = () => {
  const { user, loading, login, register } = useAuth()
  const { teams, loadTeams, createNewTeam, joinTeam } = useTeams()
  const { availableMatches, loadAvailableMatches, createNewMatch, joinMatch } = useMatches()
  const { payments, processPayment } = usePayments()
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id)

  useEffect(() => {
    if (user) {
      loadTeams()
      loadAvailableMatches()
    }
  }, [user])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>{/* Login/Register forms */}</div>
  }

  return (
    <div>
      {/* Main app with teams, matches, payments, notifications */}
      <header>
        <div>Notifications: {unreadCount}</div>
      </header>

      <main>
        {/* Teams section */}
        <section>
          <h2>Teams</h2>
          {teams.map((team) => (
            <div key={team.id}>
              <h3>{team.name}</h3>
              <button onClick={() => joinTeam(team.id)}>Join Team</button>
            </div>
          ))}
        </section>

        {/* Matches section */}
        <section>
          <h2>Available Matches</h2>
          {availableMatches.map((match) => (
            <div key={match.id}>
              <h3>{match.title}</h3>
              <button onClick={() => joinMatch(match.id, "team-id")}>Join Match</button>
            </div>
          ))}
        </section>

        {/* Notifications section */}
        <section>
          <h2>Notifications</h2>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              style={{
                fontWeight: notification.is_read ? "normal" : "bold",
              }}
            >
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
