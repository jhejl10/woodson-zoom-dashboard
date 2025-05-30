import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Simple check for authentication - just verify if the zoom_tokens cookie exists
    const cookieStore = cookies()
    const zoomTokens = cookieStore.get("zoom_tokens")

    // Return a simple response - don't try to parse or validate the token here
    return NextResponse.json({
      authenticated: !!zoomTokens,
      authType: "oauth",
    })
  } catch (error) {
    console.error("Critical error in auth status:", error)

    // Always return a valid JSON response, even on error
    return NextResponse.json(
      {
        authenticated: false,
        authType: "error",
        error: "Authentication check failed",
      },
      { status: 200 },
    ) // Force 200 status to prevent client-side errors
  }
}
