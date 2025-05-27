import { type NextRequest, NextResponse } from "next/server"
import { shareRecording } from "@/lib/zoom-recordings-api"

export async function POST(request: NextRequest, { params }: { params: { recordingId: string } }) {
  try {
    const body = await request.json()
    const { share_type, password, expiry_days, allow_download } = body

    const result = await shareRecording(params.recordingId, {
      share_type,
      password,
      expiry_days,
      allow_download,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sharing recording:", error)
    return NextResponse.json({ error: "Failed to share recording" }, { status: 500 })
  }
}
