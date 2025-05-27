import { type NextRequest, NextResponse } from "next/server"
import { updateUserPresence } from "@/lib/zoom-api"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, status, status_message } = body

    if (!user_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await updateUserPresence(user_id, status, status_message)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating user presence:", error)
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 })
  }
}
