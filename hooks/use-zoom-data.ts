"use client"

import { useState, useEffect } from "react"
import { isDevMode } from "@/lib/dev-mode"
import { mockUsers, mockQueues, mockCalls, mockVoicemails, mockRecordings } from "@/lib/mock-data"

export function useZoomUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDevMode()) {
      // Use mock data in development/preview
      setTimeout(() => {
        setUsers(mockUsers)
        setLoading(false)
      }, 1000) // Simulate loading delay
      return
    }

    // Rest of the existing fetch logic...
    const fetchData = async () => {
      try {
        const response = await fetch("/api/zoom/users")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setUsers(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { users, loading, error, refetch: () => {} }
}

export function useZoomQueues() {
  const [queues, setQueues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDevMode()) {
      // Use mock data in development/preview
      setTimeout(() => {
        setQueues(mockQueues)
        setLoading(false)
      }, 1000) // Simulate loading delay
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/zoom/queues")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setQueues(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { queues, loading, error, refetch: () => {} }
}

export function useZoomCalls() {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDevMode()) {
      // Use mock data in development/preview
      setTimeout(() => {
        setCalls(mockCalls)
        setLoading(false)
      }, 1000) // Simulate loading delay
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/zoom/calls")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setCalls(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { calls, loading, error, refetch: () => {} }
}

export function useZoomVoicemails() {
  const [voicemails, setVoicemails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDevMode()) {
      // Use mock data in development/preview
      setTimeout(() => {
        setVoicemails(mockVoicemails)
        setLoading(false)
      }, 1000) // Simulate loading delay
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/zoom/voicemails")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setVoicemails(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { voicemails, loading, error, refetch: () => {} }
}

export function useZoomRecordings() {
  const [recordings, setRecordings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDevMode()) {
      // Use mock data in development/preview
      setTimeout(() => {
        setRecordings(mockRecordings)
        setLoading(false)
      }, 1000) // Simulate loading delay
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/zoom/recordings")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setRecordings(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { recordings, loading, error, refetch: () => {} }
}
