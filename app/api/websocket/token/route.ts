import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/zoom-auth"

export async function GET() {
  try {
    // Get the access token from our auth system
    const token = await getValidAccessToken()

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error getting WebSocket token:", error)
    return NextResponse.json({ error: "Failed to get WebSocket token" }, { status: 500 })
  }
}
