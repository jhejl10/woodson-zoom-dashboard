import { NextResponse } from "next/server"
import { getZoomCache } from "@/lib/cache-manager"

export async function POST(request: Request) {
  try {
    const { userId, presenceData } = await request.json()

    if (!userId || !presenceData) {
      return NextResponse.json({ error: "Missing userId or presenceData" }, { status: 400 })
    }

    const cache = await getZoomCache()
    cache.updateUserPresence(userId, presenceData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating presence cache:", error)
    return NextResponse.json({ error: "Failed to update presence cache" }, { status: 500 })
  }
}
