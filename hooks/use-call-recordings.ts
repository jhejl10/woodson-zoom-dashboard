"use client"

import { useState, useEffect, useCallback } from "react"

interface UseCallRecordingsOptions {
  userId?: string
  from?: string
  to?: string
  pageSize?: number
  refreshInterval?: number
  enabled?: boolean
}

export function useCallRecordings(options: UseCallRecordingsOptions = {}) {
  const { userId, from, to, pageSize = 50, refreshInterval = 0, enabled = true } = options
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [totalRecords, setTotalRecords] = useState(0)

  const fetchRecordings = useCallback(async () => {
    if (!enabled) return

    try {
      const params = new URLSearchParams()
      if (userId) params.append("user_id", userId)
      if (from) params.append("from", from)
      if (to) params.append("to", to)
      params.append("page_size", pageSize.toString())

      const response = await fetch(`/api/phone/recordings?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch recordings")

      const data = await response.json()
      setRecordings(data.recordings)
      setNextPageToken(data.next_page_token)
      setTotalRecords(data.total_records)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [userId, from, to, pageSize, enabled])

  useEffect(() => {
    fetchRecordings()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchRecordings, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchRecordings, refreshInterval])

  const deleteRecording = async (recordingId: string) => {
    try {
      const response = await fetch(`/api/phone/recordings/${recordingId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete recording")

      // Remove from local state
      setRecordings((prev) => prev.filter((r: any) => r.id !== recordingId))
      return true
    } catch (error) {
      console.error("Error deleting recording:", error)
      return false
    }
  }

  const generateTranscript = async (recordingId: string, language = "en-US") => {
    try {
      const response = await fetch(`/api/phone/recordings/${recordingId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      })
      if (!response.ok) throw new Error("Failed to generate transcript")

      const result = await response.json()
      // Refresh recordings to get updated transcript status
      fetchRecordings()
      return result
    } catch (error) {
      console.error("Error generating transcript:", error)
      throw error
    }
  }

  return {
    recordings,
    loading,
    error,
    nextPageToken,
    totalRecords,
    refetch: fetchRecordings,
    deleteRecording,
    generateTranscript,
  }
}
