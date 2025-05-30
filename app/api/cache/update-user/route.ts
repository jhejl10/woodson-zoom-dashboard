import { NextResponse } from "next/server"
import { getZoomCache } from "@/lib/cache-manager"

export async function POST(request: Request) {
  try {
    const { userId, userData } = await request.json()

    if (!userId || !userData) {
      return NextResponse.json({ error: "Missing userId or userData" }, { status: 400 })
    }

    const cache = await getZoomCache()
    cache.updateUser(userId, userData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user cache:", error)
    return NextResponse.json({ error: "Failed to update user cache" }, { status: 500 })
  }
}
