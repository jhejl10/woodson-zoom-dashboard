import { type NextRequest, NextResponse } from "next/server"
import { getSMSMessages, sendSMS } from "@/lib/zoom-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    const messages = await getSMSMessages(userId || undefined)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching SMS messages:", error)
    return NextResponse.json({ error: "Failed to fetch SMS messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to, message } = body

    if (!from || !to || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sendSMS(from, to, message)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending SMS:", error)
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 })
  }
}
