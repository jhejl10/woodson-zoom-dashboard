import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasClientId: !!process.env.ZOOM_CLIENT_ID,
    clientIdPreview: process.env.ZOOM_CLIENT_ID?.substring(0, 8) + "...",
    hasClientSecret: !!process.env.ZOOM_CLIENT_SECRET,
    redirectUri: process.env.ZOOM_REDIRECT_URI,
    timestamp: new Date().toISOString(),
  })
}
