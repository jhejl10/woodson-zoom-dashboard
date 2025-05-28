"use client"

import { useState, useEffect, useCallback } from "react"

interface UseZoomDataOptions {
  refreshInterval?: number
  enabled?: boolean
}

// Ultra-safe array processing function
function ultraSafeProcessArray(data: any, fallback: any[] = []): any[] {
  try {
    console.log("ultraSafeProcessArray input:", data, typeof data)

    // Handle null/undefined/false/0/empty string
    if (!data) {
      console.log("Data is falsy, returning fallback")
      return fallback
    }

    // Handle direct array
    if (Array.isArray(data)) {
      console.log("Data is direct array, filtering...")
      const filtered = data.filter((item) => {
        if (item === null || item === undefined) {
          console.log("Filtering out null/undefined item")
          return false
        }
        return true
      })
      console.log("Filtered array result:", filtered)
      return filtered
    }

    // Handle nested object with array property
    if (typeof data === "object" && data !== null) {
      console.log("Data is object, checking for array properties...")
      const keys = ["users", "calls", "queues", "voicemails", "recordings", "data", "items", "results"]

      for (const key of keys) {
        if (data.hasOwnProperty(key) && Array.isArray(data[key])) {
          console.log(`Found array at key: ${key}`)
          const filtered = data[key].filter((item) => {
            if (item === null || item === undefined) {
              console.log("Filtering out null/undefined item from nested array")
              return false
            }
            return true
          })
          console.log("Filtered nested array result:", filtered)
          return filtered
        }
      }
    }

    console.log("No array found, returning fallback")
    return fallback
  } catch (error) {
    console.error("Error in ultraSafeProcessArray:", error)
    return fallback
  }
}

// Safe forEach wrapper
function safeForEach<T>(array: any, callback: (item: T, index: number, array: T[]) => void): void {
  try {
    if (!Array.isArray(array)) {
      console.warn("safeForEach: input is not an array:", array)
      return
    }

    array.forEach((item, index, arr) => {
      try {
        callback(item, index, arr)
      } catch (error) {
        console.error("Error in forEach callback:", error)
      }
    })
  } catch (error) {
    console.error("Error in safeForEach:", error)
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
      console.log("Fetching users...")

      const response = await fetch("/api/phone/users")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw users API response:", data)

      // Use ultra-safe array processing
      const processedUsers = ultraSafeProcessArray(data, [])
      console.log("Final processed users:", processedUsers)

      // Ensure we always set an array
      if (Array.isArray(processedUsers)) {
        setUsers(processedUsers)
      } else {
        console.warn("processedUsers is not an array, setting empty array")
        setUsers([])
      }
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
      console.log("Fetching calls...")

      const response = await fetch(`/api/phone/calls?type=${type}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw calls API response:", data)

      // Use ultra-safe array processing
      const processedCalls = ultraSafeProcessArray(data, [])
      console.log("Final processed calls:", processedCalls)

      // Ensure we always set an array
      if (Array.isArray(processedCalls)) {
        setCalls(processedCalls)
      } else {
        console.warn("processedCalls is not an array, setting empty array")
        setCalls([])
      }
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
      console.log("Fetching queues...")

      const response = await fetch("/api/phone/queues")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw queues API response:", data)

      // Use ultra-safe array processing
      const processedQueues = ultraSafeProcessArray(data, [])
      console.log("Final processed queues:", processedQueues)

      // Ensure we always set an array
      if (Array.isArray(processedQueues)) {
        setQueues(processedQueues)
      } else {
        console.warn("processedQueues is not an array, setting empty array")
        setQueues([])
      }
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
      console.log("Fetching voicemails...")

      const url = userId ? `/api/phone/voicemails?user_id=${userId}` : "/api/phone/voicemails"
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw voicemails API response:", data)

      // Use ultra-safe array processing
      const processedVoicemails = ultraSafeProcessArray(data, [])
      console.log("Final processed voicemails:", processedVoicemails)

      // Ensure we always set an array
      if (Array.isArray(processedVoicemails)) {
        setVoicemails(processedVoicemails)
      } else {
        console.warn("processedVoicemails is not an array, setting empty array")
        setVoicemails([])
      }
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
      console.log("Fetching recordings...")

      const response = await fetch("/api/phone/recordings")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw recordings API response:", data)

      // Use ultra-safe array processing
      const processedRecordings = ultraSafeProcessArray(data, [])
      console.log("Final processed recordings:", processedRecordings)

      // Ensure we always set an array
      if (Array.isArray(processedRecordings)) {
        setRecordings(processedRecordings)
      } else {
        console.warn("processedRecordings is not an array, setting empty array")
        setRecordings([])
      }
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

// Export the safe utilities for use in components
export { ultraSafeProcessArray, safeForEach }
