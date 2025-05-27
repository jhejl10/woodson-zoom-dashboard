import { NextResponse } from "next/server"

export async function GET() {
  const hasClientId = !!process.env.ZOOM_CLIENT_ID
  const hasClientSecret = !!process.env.ZOOM_CLIENT_SECRET
  const hasRedirectUri = !!process.env.ZOOM_REDIRECT_URI

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasClientId,
    hasClientSecret,
    hasRedirectUri,
    redirectUri: process.env.ZOOM_REDIRECT_URI, // Only show this for debugging
  })
}
