import { NextResponse } from "next/server"
import { getZoomCache } from "@/lib/cache-manager"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const refresh = searchParams.get("refresh") === "true"

    console.log("Common areas API called, refresh:", refresh)

    const cache = await getZoomCache()

    let commonAreas: any[] = []

    if (refresh) {
      // Force refresh the cache
      await cache.forceRefresh("common_areas")
    }

    // Get common areas from cache
    commonAreas = await cache.getCommonAreas()

    console.log("Common areas from cache:", commonAreas)

    return NextResponse.json({
      common_areas: commonAreas,
      cached: !refresh,
      count: commonAreas.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in common areas API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch common areas",
        details: error instanceof Error ? error.message : "Unknown error",
        common_areas: [],
        count: 0,
      },
      { status: 500 },
    )
  }
}
