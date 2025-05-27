import { type NextRequest, NextResponse } from "next/server"
import { getCallRecording, deleteCallRecording } from "@/lib/zoom-recordings-api"

export async function GET(request: NextRequest, { params }: { params: { recordingId: string } }) {
  try {
    const recording = await getCallRecording(params.recordingId)
    return NextResponse.json(recording)
  } catch (error) {
    console.error("Error fetching call recording:", error)
    return NextResponse.json({ error: "Failed to fetch call recording" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { recordingId: string } }) {
  try {
    const result = await deleteCallRecording(params.recordingId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting call recording:", error)
    return NextResponse.json({ error: "Failed to delete call recording" }, { status: 500 })
  }
}
