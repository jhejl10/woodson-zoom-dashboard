"use client"

import { useState, useEffect, useCallback } from "react"

interface UseZoomDataOptions {
  refreshInterval?: number
  enabled?: boolean
}

export function useZoomUsers(options: UseZoomDataOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!enabled) return

    try {
      const response = await fetch("/api/phone/users")
      if (!response.ok) throw new Error("Failed to fetch users")

      const data = await response.json()

      // Ensure we always set an array
      const usersData = data?.users || data || []
      setUsers(Array.isArray(usersData) ? usersData : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setUsers([]) // Always set empty array on error
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
      const response = await fetch(`/api/phone/calls?type=${type}`)
      if (!response.ok) throw new Error("Failed to fetch calls")

      const data = await response.json()

      // Ensure we always set an array
      const callsData = data?.calls || data || []
      setCalls(Array.isArray(callsData) ? callsData : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching calls:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setCalls([]) // Always set empty array on error
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
      const response = await fetch("/api/phone/queues")
      if (!response.ok) throw new Error("Failed to fetch queues")

      const data = await response.json()

      // Ensure we always set an array
      const queuesData = data?.queues || data || []
      setQueues(Array.isArray(queuesData) ? queuesData : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching queues:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setQueues([]) // Always set empty array on error
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
      const url = userId ? `/api/phone/voicemails?user_id=${userId}` : "/api/phone/voicemails"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch voicemails")

      const data = await response.json()

      // Ensure we always set an array
      const voicemailsData = data?.voicemails || data || []
      setVoicemails(Array.isArray(voicemailsData) ? voicemailsData : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching voicemails:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setVoicemails([]) // Always set empty array on error
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
      const response = await fetch("/api/phone/recordings")
      if (!response.ok) throw new Error("Failed to fetch recordings")

      const data = await response.json()

      // Ensure we always set an array
      const recordingsData = data?.recordings || data || []
      setRecordings(Array.isArray(recordingsData) ? recordingsData : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching recordings:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setRecordings([]) // Always set empty array on error
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
