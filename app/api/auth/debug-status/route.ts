import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get all cookies for debugging
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    // Get specific auth cookies if they exist
    const zoomAccessToken = cookieStore.get("zoom_access_token")
    const zoomRefreshToken = cookieStore.get("zoom_refresh_token")

    return NextResponse.json({
      success: true,
      cookies: {
        count: allCookies.length,
        names: allCookies.map((c) => c.name),
        hasAccessToken: !!zoomAccessToken,
        hasRefreshToken: !!zoomRefreshToken,
        accessTokenExpiry: zoomAccessToken
          ? new Date(Number.parseInt(zoomAccessToken.value.split(".")[1]) * 1000).toISOString()
          : null,
      },
    })
  } catch (error) {
    console.error("Error in debug-status:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in debug-status",
    })
  }
}
