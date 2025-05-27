import { type NextRequest, NextResponse } from "next/server"
import { handleZoomCallback } from "@/lib/zoom-auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Add detailed logging
  console.log("Full callback URL:", request.url)
  console.log("All search params:", Object.fromEntries(searchParams.entries()))
  console.log("OAuth callback received:", {
    code: !!code,
    codeLength: code?.length,
    state,
    stateLength: state?.length,
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
      code: !!code,
      codePresent: !!code,
      codeValue: code?.substring(0, 10) + "...",
      state: !!state,
      statePresent: !!state,
      stateValue: state,
    })
    return NextResponse.redirect(new URL("/auth/error?error=missing_parameters", request.url))
  }

  try {
    await handleZoomCallback(code, state)
    console.log("OAuth callback successful")
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      new URL(`/auth/error?error=callback_failed&description=${encodeURIComponent(String(error))}`, request.url),
    )
  }
}
