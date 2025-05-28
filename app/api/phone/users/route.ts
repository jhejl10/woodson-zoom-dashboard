import { NextResponse } from "next/server"
import { getPhoneUsers, getSites, getCommonAreaPhones, getUserPresence } from "@/lib/zoom-api"

export async function GET() {
  try {
    // Fetch all data in parallel
    const [phoneUsers, sites, commonAreaPhones] = await Promise.all([
      getPhoneUsers(),
      getSites(),
      getCommonAreaPhones(),
    ])

    console.log("Raw phone users:", phoneUsers)
    console.log("Raw sites:", sites)
    console.log("Raw common area phones:", commonAreaPhones)

    // Create a site lookup map
    const siteMap = new Map()
    sites.forEach((site: any) => {
      siteMap.set(site.id, site.name)
    })

    // Process regular users
    const processedUsers = await Promise.all(
      phoneUsers.map(async (user: any) => {
        // Try to get presence status
        let presence = null
        try {
          presence = await getUserPresence(user.id)
        } catch (error) {
          console.log(`Could not fetch presence for user ${user.id}:`, error)
        }

        return {
          id: user.id,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          extension: user.extension?.number || user.phone_number || "No extension",
          phone_number: user.phone_number,
          site: siteMap.get(user.site_id) || "Unknown Site",
          site_id: user.site_id,
          status: user.status,
          presence: presence?.status || "unknown",
          presence_status: presence?.status_message || null,
          type: "user",
          avatar_url: user.avatar_url || null,
          department: user.department || null,
          job_title: user.job_title || null,
          location: user.location || null,
        }
      }),
    )

    // Process common area phones
    const processedCommonAreaPhones = commonAreaPhones.map((phone: any) => ({
      id: phone.id,
      name: phone.name || phone.display_name || `Common Area ${phone.id}`,
      extension: phone.extension?.number || phone.phone_number || "No extension",
      phone_number: phone.phone_number,
      site: siteMap.get(phone.site_id) || "Unknown Site",
      site_id: phone.site_id,
      status: phone.status || "active",
      presence: "available", // Common area phones are typically always available
      presence_status: null,
      type: "common_area",
      avatar_url: null,
      department: "Common Area",
      job_title: "Common Area Phone",
      location: phone.location || null,
    }))

    // Combine all users
    const allUsers = [...processedUsers, ...processedCommonAreaPhones]

    console.log("Processed users:", allUsers)

    return NextResponse.json({
      users: allUsers,
      total: allUsers.length,
      regular_users: processedUsers.length,
      common_area_phones: processedCommonAreaPhones.length,
    })
  } catch (error) {
    console.error("Error fetching phone users:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
