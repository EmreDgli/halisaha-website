"use client"

import { useAuthContext } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function TestAuthPage() {
  const { user, loading, isAuthenticated, isInitialized } = useAuthContext()
  const [authState, setAuthState] = useState<any>(null)

  useEffect(() => {
    setAuthState({
      user: user,
      loading: loading,
      isAuthenticated: isAuthenticated,
      isInitialized: isInitialized,
      timestamp: new Date().toISOString()
    })
  }, [user, loading, isAuthenticated, isInitialized])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>🔐 Authentication Test Sayfası</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Authentication State</h3>
              <p>Loading: {loading ? "✅" : "❌"}</p>
              <p>Initialized: {isInitialized ? "✅" : "❌"}</p>
              <p>Authenticated: {isAuthenticated ? "✅" : "❌"}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">User Data</h3>
              <p>User exists: {user ? "✅" : "❌"}</p>
              <p>Profile exists: {user?.profile ? "✅" : "❌"}</p>
              <p>User ID: {user?.user?.id || "N/A"}</p>
              <p>Email: {user?.user?.email || "N/A"}</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Profile Data</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(user?.profile, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800">Auth State History</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>

          <div className="flex space-x-4">
            <Button 
              onClick={() => window.location.href = "/auth/login"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔐 Login Sayfasına Git
            </Button>
            <Button 
              onClick={() => window.location.href = "/auth/register"}
              className="bg-green-600 hover:bg-green-700"
            >
              📝 Register Sayfasına Git
            </Button>
            <Button 
              onClick={() => window.location.href = "/dashboard/player"}
              className="bg-purple-600 hover:bg-purple-700"
            >
              🏃‍♂️ Player Dashboard'a Git
            </Button>
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-gray-600 hover:bg-gray-700"
            >
              🏠 Ana Sayfaya Git
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 