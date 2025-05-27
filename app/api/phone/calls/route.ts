import { type NextRequest, NextResponse } from "next/server"
import { getCallHistory, makeCall, getActiveCalls } from "@/lib/zoom-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")

    if (type === "active") {
      const activeCalls = await getActiveCalls()
      return NextResponse.json({ calls: activeCalls })
    } else {
      const from = searchParams.get("from")
      const to = searchParams.get("to")
      const userId = searchParams.get("user_id")

      const callHistory = await getCallHistory(userId || undefined, from || undefined, to || undefined)
      return NextResponse.json({ calls: callHistory })
    }
  } catch (error) {
    console.error("Error fetching calls:", error)
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caller_id, callee } = body

    if (!caller_id || !callee) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await makeCall(caller_id, callee)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error making call:", error)
    return NextResponse.json({ error: "Failed to make call" }, { status: 500 })
  }
}
