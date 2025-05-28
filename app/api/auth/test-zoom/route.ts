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
      secretPreview: process.env.ZOOM_CLIENT_SECRET?.substring(0, 8) + "...",
      redirectUri: process.env.ZOOM_REDIRECT_URI,
      nodeEnv: process.env.NODE_ENV,
    }

    console.log("Environment check:", envCheck)

    // Test 2: Try to validate app credentials
    let appValidation = null
    let appError = null

    try {
      // Test the client credentials by making a basic request
      const testAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.ZOOM_REDIRECT_URI!)}&state=test`
      
      appValidation = {
        authUrlGenerated: true,
        authUrl: testAuthUrl,
        credentialsPresent: !!(process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET),
      }
    } catch (error) {
      appError = error instanceof Error ? error.message : "Unknown error"
    }

    // Test 3: Validate redirect URI format
    const redirectUriCheck = {
      isHttps: process.env.ZOOM_REDIRECT_URI?.startsWith("https://"),
      hasCallback: process.env.ZOOM_REDIRECT_URI?.includes("/auth/zoom/callback"),
      fullUri: process.env.ZOOM_REDIRECT_URI,
      isValid: process.env.ZOOM_REDIRECT_URI?.startsWith("https://") && 
               process.env.ZOOM_REDIRECT_URI?.includes("/auth/zoom/callback"),
    }

    const result = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      appValidation,
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

    if (!redirectUriCheck.hasCallback) {
      result.recommendations.push("Redirect URI should end with /auth/zoom/callback")
    }

    if (appError) {
      result.recommendations.push("App credentials may be invalid - check Client ID and Secret")
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
