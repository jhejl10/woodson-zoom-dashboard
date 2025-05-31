import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

// Store recent events in memory (in production, use Redis or database)
const recentEvents = new Map<string, any[]>()

// Webhook verification
function verifyWebhookSignature(payload: string, signature: string, secretToken: string): boolean {
  try {
    const expectedSignature = crypto.createHmac("sha256", secretToken).update(payload).digest("hex")

    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const signature = headersList.get("x-zm-signature")
    const timestamp = headersList.get("x-zm-request-timestamp")

    const body = await request.text()
    console.log("Received Zoom webhook:", body)

    // Parse the webhook payload
    let payload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      console.error("Invalid JSON in webhook payload:", error)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    // Handle webhook verification challenge
    if (payload.event === "endpoint.url_validation") {
      console.log("Webhook verification challenge received")
      return NextResponse.json({
        plainToken: payload.payload.plainToken,
        encryptedToken: crypto
          .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN || "")
          .update(payload.payload.plainToken)
          .digest("hex"),
      })
    }

    // Verify webhook signature (skip in development)
    if (process.env.NODE_ENV === "production" && signature) {
      const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN
      if (!secretToken) {
        console.error("ZOOM_WEBHOOK_SECRET_TOKEN not configured")
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
      }

      if (!verifyWebhookSignature(body, signature, secretToken)) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Process the webhook event
    const eventType = payload.event
    const eventData = payload.payload

    console.log(`Processing webhook event: ${eventType}`)

    // Store event for real-time updates
    const eventKey = getEventKey(eventType)
    if (!recentEvents.has(eventKey)) {
      recentEvents.set(eventKey, [])
    }

    const events = recentEvents.get(eventKey)!
    events.unshift({
      ...eventData,
      event_type: eventType,
      timestamp: Date.now(),
      webhook_timestamp: timestamp,
    })

    // Keep only last 50 events per type
    if (events.length > 50) {
      events.splice(50)
    }

    // Handle specific event types
    switch (eventType) {
      case "phone.call_started":
      case "phone.call_ended":
      case "phone.call_transferred":
        console.log("Call event received:", eventData)
        break

      case "user.presence_status_updated":
        console.log("Presence event received:", eventData)
        // Update cache if needed
        await updatePresenceCache(eventData.object.id, {
          status: eventData.object.presence_status,
          status_message: eventData.object.status_message,
        })
        break

      case "phone.voicemail_received":
        console.log("Voicemail event received:", eventData)
        break

      case "phone.sms_received":
      case "phone.sms_sent":
        console.log("SMS event received:", eventData)
        break

      default:
        console.log("Unhandled webhook event:", eventType, eventData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getEventKey(eventType: string): string {
  if (eventType.startsWith("phone.call_")) return "call_events"
  if (eventType.includes("presence")) return "presence_events"
  if (eventType.includes("voicemail")) return "voicemail_events"
  if (eventType.includes("sms")) return "sms_events"
  return "other_events"
}

async function updatePresenceCache(userId: string, presenceData: any) {
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

// GET endpoint to retrieve recent events (for polling)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (eventType === "all") {
      const allEvents: any = {}
      for (const [key, events] of recentEvents.entries()) {
        allEvents[key] = events.slice(0, limit)
      }
      return NextResponse.json(allEvents)
    } else {
      const events = recentEvents.get(eventType) || []
      return NextResponse.json(events.slice(0, limit))
    }
  } catch (error) {
    console.error("Error retrieving webhook events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
