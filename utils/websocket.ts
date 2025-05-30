import { WebSocketClient } from "../lib/websocket-client"

// Singleton instance for the WebSocket client
let wsClientInstance: WebSocketClient | null = null

/**
 * Get the WebSocket client instance (creates one if it doesn't exist)
 */
export function getWebSocketClient(): WebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient()
  }
  return wsClientInstance
}
