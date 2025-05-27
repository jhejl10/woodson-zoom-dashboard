import { NextResponse } from "next/server"
import { getCallQueues, getSites } from "@/lib/zoom-api"

export async function GET() {
  try {
    const [queues, sites] = await Promise.all([getCallQueues(), getSites()])

    const queuesWithSites = queues.map((queue: any) => ({
      ...queue,
      site: sites.find((site: any) => site.id === queue.site_id)?.name || "Unknown Site",
    }))

    return NextResponse.json({ queues: queuesWithSites })
  } catch (error) {
    console.error("Error fetching call queues:", error)
    return NextResponse.json({ error: "Failed to fetch call queues" }, { status: 500 })
  }
}
