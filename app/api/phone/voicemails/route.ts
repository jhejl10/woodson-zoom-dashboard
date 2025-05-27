import { type NextRequest, NextResponse } from "next/server"
import { getVoicemails } from "@/lib/zoom-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    const voicemails = await getVoicemails(userId || undefined)
    return NextResponse.json({ voicemails })
  } catch (error) {
    console.error("Error fetching voicemails:", error)
    return NextResponse.json({ error: "Failed to fetch voicemails" }, { status: 500 })
  }
}
