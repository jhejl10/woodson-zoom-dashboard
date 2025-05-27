import { type NextRequest, NextResponse } from "next/server"
import { transferCall, endCall, holdCall, muteCall } from "@/lib/zoom-api"

export async function DELETE(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const result = await endCall(params.callId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error ending call:", error)
    return NextResponse.json({ error: "Failed to end call" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    let result
    switch (action) {
      case "transfer":
        result = await transferCall(params.callId, data.transfer_to)
        break
      case "hold":
        result = await holdCall(params.callId, data.hold)
        break
      case "mute":
        result = await muteCall(params.callId, data.mute)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating call:", error)
    return NextResponse.json({ error: "Failed to update call" }, { status: 500 })
  }
}
