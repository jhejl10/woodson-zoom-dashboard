import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== ZOOM APP TEST ===")

    // Test 1: Environment Variables
    const envCheck = {
      hasClientId: !!process.env.ZOOM_CLIENT_ID,
      clientIdLength: process.env.ZOOM_CLIENT_ID?.length,
      clientIdPreview: process.env.ZOOM_CLIENT_ID?.substring(0, 8) + "...",
      hasClientSecret: !!process.env.ZOOM_CLIENT_SECRET,
      secretLength: process.env.ZOOM_CLIENT_SECRET?.length,
      redirectUri: process.env.ZOOM_REDIRECT_URI,
      nodeEnv: process.env.NODE_ENV,
    }

    console.log("Environment check:", envCheck)

    // Test 2: Try to get app info from Zoom
    let appInfo = null
    let appError = null

    try {
      // This endpoint doesn't require user auth, just app credentials
      const response = await fetch("https://api.zoom.us/v2/oauth/clientinfo", {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        appInfo = await response.json()
      } else {
        appError = `HTTP ${response.status}: ${response.statusText}`
        const errorBody = await response.text()
        console.log("App info error response:", errorBody)
      }
    } catch (error) {
      appError = error instanceof Error ? error.message : "Unknown error"
    }

    // Test 3: Validate redirect URI format
    const redirectUriCheck = {
      isHttps: process.env.ZOOM_REDIRECT_URI?.startsWith("https://"),
      hasCallback: process.env.ZOOM_REDIRECT_URI?.includes("/auth/zoom/callback"),
      fullUri: process.env.ZOOM_REDIRECT_URI,
    }

    const result = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      appInfo,
      appError,
      redirectUriCheck,
      recommendations: [],
    }

    // Add recommendations based on findings
    if (!envCheck.hasClientId || !envCheck.hasClientSecret) {
      result.recommendations.push("Missing Zoom app credentials - check environment variables")
    }

    if (!redirectUriCheck.isHttps && process.env.NODE_ENV === "production") {
      result.recommendations.push("Redirect URI should use HTTPS in production")
    }

    if (appError) {
      result.recommendations.push("App credentials may be invalid - check Client ID and Secret")
    }

    if (appInfo && !appInfo.published) {
      result.recommendations.push("Zoom app may need to be published or activated")
    }

    console.log("Test result:", result)
    console.log("=== END TEST ===")

    return NextResponse.json(result)
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
