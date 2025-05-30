import { NextResponse } from "next/server"
import { getCurrentUser, getSites } from "@/lib/zoom-api"

export async function GET() {
  try {
    console.log("=== DEBUG: Testing API connections ===")

    // Test basic user connection
    const currentUser = await getCurrentUser()
    console.log("Current user test:", currentUser ? "SUCCESS" : "FAILED")

    // Test sites connection
    const sites = await getSites()
    console.log("Sites test:", Array.isArray(sites) ? `SUCCESS (${sites.length} sites)` : "FAILED")

    return NextResponse.json({
      success: true,
      tests: {
        current_user: !!currentUser,
        sites: Array.isArray(sites),
        sites_count: Array.isArray(sites) ? sites.length : 0,
      },
      current_user: currentUser,
      sites: sites,
    })
  } catch (error) {
    console.error("Debug test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
