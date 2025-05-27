import { type NextRequest, NextResponse } from "next/server"
import { getRecordingTranscript, generateRecordingTranscript } from "@/lib/zoom-recordings-api"

export async function GET(request: NextRequest, { params }: { params: { recordingId: string } }) {
  try {
    const transcript = await getRecordingTranscript(params.recordingId)
    return NextResponse.json(transcript)
  } catch (error) {
    console.error("Error fetching recording transcript:", error)
    return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { recordingId: string } }) {
  try {
    const body = await request.json()
    const { language = "en-US" } = body

    const result = await generateRecordingTranscript(params.recordingId, language)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating recording transcript:", error)
    return NextResponse.json({ error: "Failed to generate transcript" }, { status: 500 })
  }
}
