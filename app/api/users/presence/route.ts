import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateUserPresence, getCurrentUser } from "@/lib/zoom-api"

export async function PATCH(request: NextRequest) {
  try {
    console.log("=== UPDATING USER PRESENCE START ===")

    const body = await request.json()
    console.log("Request body:", body)

    const { status, status_message } = body

    if (!status) {
      console.error("Status is required")
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Get the current user's ID
    console.log("Getting current user...")
    const currentUser = await getCurrentUser()
    console.log("Current user response:", currentUser)

    if (!currentUser || !currentUser.id) {
      console.error("Could not get current user")
      return NextResponse.json({ error: "Could not get current user" }, { status: 401 })
    }

    console.log(
      `Updating presence for current user ${currentUser.id} to ${status}${status_message ? ` with message: ${status_message}` : ""}`,
    )

    const result = await updateUserPresence(currentUser.id, status, status_message)
    console.log("Update presence result:", result)

    console.log("=== UPDATING USER PRESENCE END ===")
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error updating user presence:", error)
    return NextResponse.json(
      {
        error: "Failed to update presence",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
