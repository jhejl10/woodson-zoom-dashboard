import { NextResponse } from "next/server"
import { getCommonAreaPhones } from "@/lib/zoom-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const refresh = searchParams.get("refresh") === "true"

    console.log("Common areas API called, refresh:", refresh)

    // Get common areas directly from the API
    const commonAreas = await getCommonAreaPhones()

    console.log("Common areas from API:", commonAreas)

    return NextResponse.json({
      common_areas: commonAreas,
      cached: false,
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
