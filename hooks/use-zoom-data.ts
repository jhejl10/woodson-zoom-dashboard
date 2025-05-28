"use client"

import { useState, useEffect, useCallback } from "react"

interface UseZoomDataOptions {
  refreshInterval?: number
  enabled?: boolean
}

// Enhanced error boundary for data processing
function safeProcessArray(data: any, fallback: any[] = []): any[] {
  try {
    // Handle null/undefined
    if (!data) return fallback

    // Handle direct array
    if (Array.isArray(data)) {
      return data.filter((item) => item != null)
    }

    // Handle nested object with array property
    if (typeof data === "object") {
      const keys = ["users", "calls", "queues", "voicemails", "recordings"]
      for (const key of keys) {
        if (Array.isArray(data[key])) {
          return data[key].filter((item) => item != null)
        }
      }
    }

    return fallback
  } catch (error) {
    console.error("Error processing array data:", error)
    return fallback
  }
}

export function useZoomUsers(options: UseZoomDataOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!enabled) return

    try {
      setError(null)
      const response = await fetch("/api/phone/users")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw users data:", data)

      // Use enhanced array processing
      const processedUsers = safeProcessArray(data, [])
      console.log("Processed users:", processedUsers)

      setUsers(processedUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setUsers([]) // Always ensure array
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchUsers()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchUsers, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchUsers, refreshInterval])

  return { users, loading, error, refetch: fetchUsers }
}

export function useZoomCalls(type: "history" | "active" = "history", options: UseZoomDataOptions = {}) {
  const { refreshInterval = 10000, enabled = true } = options
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalls = useCallback(async () => {
    if (!enabled) return

    try {
      setError(null)
      const response = await fetch(`/api/phone/calls?type=${type}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw calls data:", data)

      // Use enhanced array processing
      const processedCalls = safeProcessArray(data, [])
      console.log("Processed calls:", processedCalls)

      setCalls(processedCalls)
    } catch (err) {
      console.error("Error fetching calls:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setCalls([]) // Always ensure array
    } finally {
      setLoading(false)
    }
  }, [type, enabled])

  useEffect(() => {
    fetchCalls()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchCalls, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchCalls, refreshInterval])

  return { calls, loading, error, refetch: fetchCalls }
}

export function useZoomQueues(options: UseZoomDataOptions = {}) {
  const { refreshInterval = 15000, enabled = true } = options
  const [queues, setQueues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueues = useCallback(async () => {
    if (!enabled) return

    try {
      setError(null)
      const response = await fetch("/api/phone/queues")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw queues data:", data)

      // Use enhanced array processing
      const processedQueues = safeProcessArray(data, [])
      console.log("Processed queues:", processedQueues)

      setQueues(processedQueues)
    } catch (err) {
      console.error("Error fetching queues:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setQueues([]) // Always ensure array
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchQueues()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchQueues, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchQueues, refreshInterval])

  return { queues, loading, error, refetch: fetchQueues }
}

export function useZoomVoicemails(userId?: string, options: UseZoomDataOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options
  const [voicemails, setVoicemails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVoicemails = useCallback(async () => {
    if (!enabled) return

    try {
      setError(null)
      const url = userId ? `/api/phone/voicemails?user_id=${userId}` : "/api/phone/voicemails"
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw voicemails data:", data)

      // Use enhanced array processing
      const processedVoicemails = safeProcessArray(data, [])
      console.log("Processed voicemails:", processedVoicemails)

      setVoicemails(processedVoicemails)
    } catch (err) {
      console.error("Error fetching voicemails:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setVoicemails([]) // Always ensure array
    } finally {
      setLoading(false)
    }
  }, [userId, enabled])

  useEffect(() => {
    fetchVoicemails()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchVoicemails, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchVoicemails, refreshInterval])

  return { voicemails, loading, error, refetch: fetchVoicemails }
}

export function useZoomRecordings(options: UseZoomDataOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options
  const [recordings, setRecordings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecordings = useCallback(async () => {
    if (!enabled) return

    try {
      setError(null)
      const response = await fetch("/api/phone/recordings")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw recordings data:", data)

      // Use enhanced array processing
      const processedRecordings = safeProcessArray(data, [])
      console.log("Processed recordings:", processedRecordings)

      setRecordings(processedRecordings)
    } catch (err) {
      console.error("Error fetching recordings:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setRecordings([]) // Always ensure array
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchRecordings()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchRecordings, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchRecordings, refreshInterval])

  return { recordings, loading, error, refetch: fetchRecordings }
}
