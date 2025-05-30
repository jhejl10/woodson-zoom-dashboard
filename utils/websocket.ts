import { getWebSocketClient as getWSClient } from "../lib/websocket-client"

/**
 * Get the WebSocket client instance (re-export from lib)
 */
export function getWebSocketClient() {
  return getWSClient()
}
