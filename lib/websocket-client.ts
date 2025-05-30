"use client"

import { EventEmitter } from "events"

export interface ZoomWebSocketEvent {
  type: string
  data: any
  timestamp: number
}

export interface CallEvent {
  call_id: string
  caller: string
  callee: string
  status: "ringing" | "answered" | "ended" | "transferred" | "held"
  direction: "inbound" | "outbound"
  user_id?: string
}

export interface PresenceEvent {
  user_id: string
  presence: "available" | "busy" | "away" | "dnd" | "offline"
  status_message?: string
}

export interface QueueEvent {
  queue_id: string
  queue_name: string
  waiting_calls: number
  longest_wait_time: number
  available_agents: number
}

export class ZoomWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isConnecting = false
  private authToken: string | null = null

  constructor() {
    super()
  }

  public async connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isConnecting = true

    try {
      // Get auth token first
      if (!this.authToken) {
        await this.getAuthToken()
      }

      // Use environment variables for WebSocket URL
      const wsBaseUrl = process.env.NEXT_PUBLIC_ZOOM_WS_URL || "wss://ws.zoom.us/ws"
      const subscriptionId = process.env.NEXT_PUBLIC_ZOOM_WS_SUBSCRIPTION_ID || "aZmzUONmRUqxJUwIf_kxHg"

      // For now, we'll use a direct connection without authentication
      // This is a temporary solution until we get the proper WebSocket authentication working
      const wsUrl = `${wsBaseUrl}?subscriptionId=${subscriptionId}`

      console.log("Connecting to Zoom WebSocket:", wsUrl)
      console.log("Auth token available:", !!this.authToken)

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected to Zoom")
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.emit("connected")
        this.startHeartbeat()

        // For now, we'll skip authentication and just enable events
        this.send({
          type: "enable_events",
          data: {
            call_events: true,
            presence_events: true,
            queue_events: true,
          },
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: ZoomWebSocketEvent = JSON.parse(event.data)
          console.log("Received WebSocket message:", message)
          this.handleMessage(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        this.isConnecting = false
        this.stopHeartbeat()
        this.emit("disconnected")

        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.isConnecting = false
        this.emit("error", error)
      }
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  private async getAuthToken() {
    try {
      // Get WebSocket token from our API
      const response = await fetch("/api/websocket/token")
      const data = await response.json()

      if (data.token) {
        console.log("Got WebSocket auth token")
        this.authToken = data.token
      } else {
        console.error("Failed to get WebSocket auth token:", data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error getting WebSocket auth token:", error)
    }
  }

  private handleMessage(message: ZoomWebSocketEvent) {
    // Handle authentication response
    if (message.module === "build_connection" && !message.success) {
      console.error("WebSocket authentication failed:", message.content)
      // For now, we'll continue without authentication
      // This is a temporary solution until we get the proper WebSocket authentication working
      return
    }

    switch (message.type) {
      case "call_event":
        const callEvent = message.data as CallEvent
        console.log("Received call event:", callEvent)
        this.emit("call_event", callEvent)
        break
      case "presence_event":
        const presenceEvent = message.data as PresenceEvent
        console.log("Received presence event:", presenceEvent)

        // Update cache via API call (since we can't import server actions in client)
        this.updatePresenceCache(presenceEvent.user_id, {
          status: presenceEvent.presence,
          status_message: presenceEvent.status_message,
        })

        this.emit("presence_event", presenceEvent)
        break
      case "queue_event":
        this.emit("queue_event", message.data as QueueEvent)
        break
      case "voicemail_event":
        this.emit("voicemail_event", message.data)
        break
      case "sms_event":
        this.emit("sms_event", message.data)
        break
      case "parked_call_event":
        console.log("Received parked call event:", message.data)
        this.emit("parked_call_event", message.data)
        break
      case "user_updated":
        // Update user cache via API call
        if (message.data.user_id) {
          this.updateUserCache(message.data.user_id, message.data)
        }
        this.emit("user_updated", message.data)
        break
      case "heartbeat":
        // Respond to heartbeat
        this.send({ type: "heartbeat_ack", data: {} })
        break
      default:
        console.log("Unknown message type:", message.type, message)
    }
  }

  private async updatePresenceCache(userId: string, presenceData: any) {
    try {
      await fetch("/api/cache/update-presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, presenceData }),
      })
    } catch (error) {
      console.error("Error updating presence cache:", error)
    }
  }

  private async updateUserCache(userId: string, userData: any) {
    try {
      await fetch("/api/cache/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userData }),
      })
    } catch (error) {
      console.error("Error updating user cache:", error)
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: "heartbeat", data: {} })
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  public send(message: { type: string; data: any }) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          ...message,
          timestamp: Date.now(),
        }),
      )
    }
  }

  public disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(1000, "Client disconnecting")
      this.ws = null
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsClient: ZoomWebSocketClient | null = null

export function getWebSocketClient(): ZoomWebSocketClient {
  if (!wsClient) {
    wsClient = new ZoomWebSocketClient()
  }
  return wsClient
}

export function disconnectWebSocket() {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}

// Also export the class directly for type checking
export { ZoomWebSocketClient as WebSocketClient }
