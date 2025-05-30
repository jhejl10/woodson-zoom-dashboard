import { NextResponse } from "next/server"
import { refreshCacheInBackground } from "@/lib/cache-manager"

// This endpoint can be called by a cron job or scheduled task
export async function GET() {
  try {
    console.log("Starting scheduled cache refresh...")
    await refreshCacheInBackground()

    return NextResponse.json({
      success: true,
      message: "Background cache refresh completed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in background cache refresh:", error)
    return NextResponse.json(
      {
        error: "Background cache refresh failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
