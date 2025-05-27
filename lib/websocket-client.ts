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

class ZoomWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isConnecting = false

  constructor() {
    super()
    this.connect()
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isConnecting = true

    try {
      // In a real implementation, this would connect to Zoom's WebSocket endpoint
      // For now, we'll simulate with a local WebSocket server
      const wsUrl =
        process.env.NODE_ENV === "production"
          ? "wss://your-websocket-server.com/zoom-events"
          : "ws://localhost:8080/zoom-events"

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.emit("connected")
        this.startHeartbeat()

        // Send authentication message
        this.send({
          type: "auth",
          data: { token: "zoom_access_token" },
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: ZoomWebSocketEvent = JSON.parse(event.data)
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

  private handleMessage(message: ZoomWebSocketEvent) {
    switch (message.type) {
      case "call_event":
        this.emit("call_event", message.data as CallEvent)
        break
      case "presence_event":
        this.emit("presence_event", message.data as PresenceEvent)
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
      case "heartbeat":
        // Respond to heartbeat
        this.send({ type: "heartbeat_ack", data: {} })
        break
      default:
        console.log("Unknown message type:", message.type)
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
