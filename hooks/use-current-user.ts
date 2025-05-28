"use client"

import { useState, useEffect, useCallback } from "react"

interface CurrentUser {
  id: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  profile_picture_url?: string
  timezone?: string
  type: number
  status: string
  phone?: {
    extension_number?: string
    phone_numbers: any[]
    site_id?: string
    site_name?: string
    calling_plans: any[]
    policy: any
  }
  presence: {
    status: string
    status_message: string
    presence_status: string
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setError(null)
      console.log("Fetching current user profile...")

      const response = await fetch("/api/auth/me")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const userData = await response.json()
      console.log("Current user data:", userData)

      if (userData.error) {
        throw new Error(userData.error)
      }

      setUser(userData)
    } catch (err) {
      console.error("Error fetching current user:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePresence = useCallback(
    async (status: string, statusMessage?: string) => {
      if (!user) return

      try {
        const response = await fetch("/api/users/presence", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            status,
            status_message: statusMessage,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update presence")
        }

        // Update local state
        setUser((prev) =>
          prev
            ? {
                ...prev,
                presence: {
                  ...prev.presence,
                  status,
                  status_message: statusMessage || prev.presence.status_message,
                  presence_status: status,
                },
              }
            : null,
        )

        return true
      } catch (error) {
        console.error("Error updating presence:", error)
        throw error
      }
    },
    [user],
  )

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updatePresence,
  }
}
