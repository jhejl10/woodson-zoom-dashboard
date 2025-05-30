import { NextResponse } from "next/server"
import { refreshCacheInBackground, getZoomCache } from "@/lib/cache-manager"

export async function POST() {
  try {
    await refreshCacheInBackground()
    const cache = await getZoomCache()

    return NextResponse.json({
      success: true,
      message: "Cache refreshed successfully",
      cache_stats: await cache.getCacheStats(),
    })
  } catch (error) {
    console.error("Error refreshing cache:", error)
    return NextResponse.json(
      {
        error: "Failed to refresh cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const cache = await getZoomCache()

    return NextResponse.json({
      cache_stats: await cache.getCacheStats(),
    })
  } catch (error) {
    console.error("Error getting cache stats:", error)
    return NextResponse.json(
      {
        error: "Failed to get cache stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
