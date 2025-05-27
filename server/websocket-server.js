const WebSocket = require("ws")
const http = require("http")

// Create HTTP server
const server = http.createServer()
const wss = new WebSocket.Server({ server })

// Store connected clients
const clients = new Map()

// Simulate real-time events
function simulateEvents() {
  const eventTypes = ["call_event", "presence_event", "queue_event", "voicemail_event"]

  setInterval(
    () => {
      if (clients.size === 0) return

      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      let eventData

      switch (eventType) {
        case "call_event":
          eventData = {
            call_id: `call_${Date.now()}`,
            caller: `+1555${Math.floor(Math.random() * 9000000) + 1000000}`,
            callee: `+1555${Math.floor(Math.random() * 9000000) + 1000000}`,
            status: ["ringing", "answered", "ended", "transferred"][Math.floor(Math.random() * 4)],
            direction: Math.random() > 0.5 ? "inbound" : "outbound",
            user_id: `user_${Math.floor(Math.random() * 100)}`,
            timestamp: Date.now(),
          }
          break

        case "presence_event":
          eventData = {
            user_id: `user_${Math.floor(Math.random() * 100)}`,
            presence: ["available", "busy", "away", "dnd", "offline"][Math.floor(Math.random() * 5)],
            status_message: "Updated via WebSocket",
            timestamp: Date.now(),
          }
          break

        case "queue_event":
          eventData = {
            queue_id: `queue_${Math.floor(Math.random() * 10)}`,
            queue_name: `Queue ${Math.floor(Math.random() * 10) + 1}`,
            waiting_calls: Math.floor(Math.random() * 10),
            longest_wait_time: Math.floor(Math.random() * 600),
            available_agents: Math.floor(Math.random() * 5),
            timestamp: Date.now(),
          }
          break

        case "voicemail_event":
          eventData = {
            voicemail_id: `vm_${Date.now()}`,
            from: `+1555${Math.floor(Math.random() * 9000000) + 1000000}`,
            duration: Math.floor(Math.random() * 120),
            is_new: true,
            timestamp: Date.now(),
          }
          break
      }

      // Broadcast to all connected clients
      const message = {
        type: eventType,
        data: eventData,
        timestamp: Date.now(),
      }

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message))
        }
      })
    },
    Math.random() * 10000 + 5000,
  ) // Random interval between 5-15 seconds
}

wss.on("connection", (ws) => {
  console.log("New WebSocket connection")

  // Add client to the map
  const clientId = Date.now().toString()
  clients.set(clientId, ws)

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "connected",
      data: { message: "Connected to Zoom Phone WebSocket" },
      timestamp: Date.now(),
    }),
  )

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log("Received message:", data)

      // Handle different message types
      switch (data.type) {
        case "auth":
          // Handle authentication
          ws.send(
            JSON.stringify({
              type: "auth_success",
              data: { message: "Authentication successful" },
              timestamp: Date.now(),
            }),
          )
          break

        case "heartbeat":
          // Respond to heartbeat
          ws.send(
            JSON.stringify({
              type: "heartbeat_ack",
              data: {},
              timestamp: Date.now(),
            }),
          )
          break

        case "subscribe":
          // Handle subscription to specific events
          console.log("Client subscribed to:", data.data.events)
          break
      }
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  })

  ws.on("close", () => {
    console.log("WebSocket connection closed")
    clients.delete(clientId)
  })

  ws.on("error", (error) => {
    console.error("WebSocket error:", error)
    clients.delete(clientId)
  })
})

// Start the server
const PORT = process.env.WS_PORT || 8080
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)

  // Start simulating events
  simulateEvents()
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down WebSocket server...")
  wss.close(() => {
    server.close(() => {
      process.exit(0)
    })
  })
})
