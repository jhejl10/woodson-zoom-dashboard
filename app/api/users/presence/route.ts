import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateUserPresence, getCurrentUser } from "@/lib/zoom-api"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { status, status_message } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Get the current user's ID
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.id) {
      return NextResponse.json({ error: "Could not get current user" }, { status: 401 })
    }

    console.log(
      `Updating presence for current user ${currentUser.id} to ${status}${
        status_message ? ` with message: ${status_message}` : ""
      }`,
    )

    const result = await updateUserPresence(currentUser.id, status, status_message)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating user presence:", error)
    return NextResponse.json(
      {
        error: "Failed to update presence",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
