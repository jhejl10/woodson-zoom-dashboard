import { type NextRequest, NextResponse } from "next/server"
import { handleZoomCallback } from "@/lib/zoom-auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Add detailed logging
  console.log("=== OAUTH CALLBACK DEBUG ===")
  console.log("Full callback URL:", request.url)
  console.log("All search params:", Object.fromEntries(searchParams.entries()))
  console.log("OAuth callback received:", {
    hasCode: !!code,
    codeLength: code?.length,
    codePreview: code?.substring(0, 20) + "...",
    hasState: !!state,
    state,
    error,
    errorDescription,
  })

  if (error) {
    console.error("OAuth error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/error?error=${error}&description=${encodeURIComponent(errorDescription || "")}`, request.url),
    )
  }

  if (!code || !state) {
    console.error("Missing required parameters:", {
      hasCode: !!code,
      hasState: !!state,
    })
    return NextResponse.redirect(new URL("/auth/error?error=missing_parameters", request.url))
  }

  try {
    console.log("Attempting to exchange code for tokens...")
    const tokens = await handleZoomCallback(code, state)
    console.log("OAuth callback successful, tokens received:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt: new Date(tokens.expires_at).toISOString(),
    })
    console.log("=== END CALLBACK DEBUG ===")
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    console.log("=== END CALLBACK DEBUG ===")
    return NextResponse.redirect(
      new URL(`/auth/error?error=callback_failed&description=${encodeURIComponent(String(error))}`, request.url),
    )
  }
}
