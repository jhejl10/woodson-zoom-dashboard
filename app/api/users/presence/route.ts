import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateUserPresence } from "@/lib/zoom-api"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, status, status_message } = body

    if (!user_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(
      `Updating presence for user ${user_id} to ${status}${status_message ? ` with message: ${status_message}` : ""}`,
    )

    const result = await updateUserPresence(user_id, status, status_message)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating user presence:", error)
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 })
  }
}
