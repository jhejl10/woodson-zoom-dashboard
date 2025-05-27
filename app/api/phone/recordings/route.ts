import { type NextRequest, NextResponse } from "next/server"
import { getCallRecordings } from "@/lib/zoom-recordings-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const pageSize = Number.parseInt(searchParams.get("page_size") || "50")
    const nextPageToken = searchParams.get("next_page_token")

    const result = await getCallRecordings(
      userId || undefined,
      from || undefined,
      to || undefined,
      pageSize,
      nextPageToken || undefined,
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching call recordings:", error)
    return NextResponse.json({ error: "Failed to fetch call recordings" }, { status: 500 })
  }
}
