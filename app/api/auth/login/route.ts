import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Enhanced environment check
    console.log("=== ZOOM AUTH DEBUG ===")
    console.log("Environment check:", {
      hasClientId: !!process.env.ZOOM_CLIENT_ID,
      clientIdLength: process.env.ZOOM_CLIENT_ID?.length,
      clientIdPreview: process.env.ZOOM_CLIENT_ID?.substring(0, 8) + "...",
      hasClientSecret: !!process.env.ZOOM_CLIENT_SECRET,
      secretLength: process.env.ZOOM_CLIENT_SECRET?.length,
      redirectUri: process.env.ZOOM_REDIRECT_URI,
      nodeEnv: process.env.NODE_ENV,
    })

    // Validate all required environment variables
    const missingVars = []
    if (!process.env.ZOOM_CLIENT_ID) missingVars.push("ZOOM_CLIENT_ID")
    if (!process.env.ZOOM_CLIENT_SECRET) missingVars.push("ZOOM_CLIENT_SECRET")
    if (!process.env.ZOOM_REDIRECT_URI) missingVars.push("ZOOM_REDIRECT_URI")

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
    }

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7)

    // Use minimal scopes first to test
    const scopes = ["user:read", "phone:read"].join(" ")

    // Build the authorization URL
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.ZOOM_CLIENT_ID,
      redirect_uri: process.env.ZOOM_REDIRECT_URI,
      scope: scopes,
      state: state,
    })

    const authUrl = `https://zoom.us/oauth/authorize?${params.toString()}`

    console.log("Generated auth URL:", authUrl)
    console.log("Auth URL params:", Object.fromEntries(params.entries()))
    console.log("=== END DEBUG ===")

    return NextResponse.json({
      success: true,
      authUrl: authUrl,
      state: state,
    })
  } catch (error) {
    console.error("Error creating auth URL:", error)
    return NextResponse.json(
      {
        error: "Failed to create auth URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
