import { NextResponse } from "next/server"
import { getZoomCache } from "@/lib/cache-manager"
import { checkDeskPhoneStatus } from "@/lib/zoom-api"

export async function GET(request: Request) {
  try {
    console.log("=== FETCHING PHONE USERS (CACHED) START ===")

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    const cache = await getZoomCache()

    // Force refresh if requested
    if (forceRefresh) {
      console.log("Force refresh requested")
      await cache.forceRefresh("all")
    }

    // Fetch all data from cache (which will fetch from API if not cached)
    const [phoneUsers, sites, commonAreaPhones] = await Promise.allSettled([
      cache.getUsers(),
      cache.getSitesData(),
      cache.getCommonAreas(),
    ])

    // Extract results with fallbacks
    const users = phoneUsers.status === "fulfilled" ? phoneUsers.value : []
    const sitesData = sites.status === "fulfilled" ? sites.value : []
    const commonAreas = commonAreaPhones.status === "fulfilled" ? commonAreaPhones.value : []

    console.log("Fetched cached data:")
    console.log("- Phone users:", Array.isArray(users) ? users.length : "not an array")
    console.log("- Sites:", Array.isArray(sitesData) ? sitesData.length : "not an array")
    console.log("- Common area phones:", Array.isArray(commonAreas) ? commonAreas.length : "not an array")

    // Create a site lookup map
    const siteMap = new Map()
    if (Array.isArray(sitesData)) {
      sitesData.forEach((site: any) => {
        if (site && site.id) {
          siteMap.set(site.id, site.name || "Unknown Site")
        }
      })
    }

    // Process regular users with cached presence data
    const processedUsers: any[] = []
    if (Array.isArray(users)) {
      for (const user of users) {
        try {
          if (!user || typeof user !== "object") {
            console.warn("Invalid user object:", user)
            continue
          }

          // Extract extension number properly
          let extension = "No extension"
          if (user.extension_number) {
            extension = user.extension_number.toString()
          } else if (user.extension && user.extension.number) {
            extension = user.extension.number.toString()
          } else if (user.phone_numbers && Array.isArray(user.phone_numbers)) {
            const phoneNumber = user.phone_numbers.find((p: any) => p.type === "extension")
            if (phoneNumber) {
              extension = phoneNumber.number
            }
          }

          // Extract phone number
          let phoneNumber = null
          if (user.phone_number) {
            phoneNumber = user.phone_number
          } else if (user.phone_numbers && Array.isArray(user.phone_numbers)) {
            const directNumber = user.phone_numbers.find((p: any) => p.type === "direct")
            if (directNumber) {
              phoneNumber = directNumber.number
            }
          }

          // Get cached presence status
          let presence = null
          let presenceStatus = "unknown"
          try {
            presence = await cache.getUserPresenceData(user.id)
            presenceStatus = presence?.status || "unknown"

            // If user is offline, check if their desk phone is online
            if (presenceStatus === "offline") {
              try {
                const isDeskPhoneOnline = await checkDeskPhoneStatus(user.id)
                if (isDeskPhoneOnline) {
                  presenceStatus = "available"
                  if (presence) {
                    presence.status_message = "Available (Desk Phone)"
                  }
                }
              } catch (deskPhoneError) {
                console.log(`Could not check desk phone for user ${user.id}:`, deskPhoneError)
              }
            }
          } catch (error) {
            console.log(`Could not fetch presence for user ${user.id}:`, error)
            presenceStatus = "unknown"
          }

          const processedUser = {
            id: user.id,
            name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              user.display_name ||
              user.email ||
              "Unknown User",
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            extension: extension,
            phone_number: phoneNumber,
            site: siteMap.get(user.site_id) || "Unknown Site",
            site_id: user.site_id,
            status: user.status || "active",
            presence: presenceStatus,
            presence_status: presence?.status_message || null,
            type: "user",
            avatar_url: user.avatar_url || null,
            department: user.department || null,
            job_title: user.job_title || null,
            location: user.location || null,
          }

          processedUsers.push(processedUser)
        } catch (error) {
          console.error("Error processing user:", user, error)
        }
      }
    }

    // Process common area phones
    const processedCommonAreaPhones: any[] = []
    if (Array.isArray(commonAreas)) {
      for (const phone of commonAreas) {
        try {
          if (!phone || typeof phone !== "object") {
            console.warn("Invalid common area phone object:", phone)
            continue
          }

          // Extract extension number properly
          let extension = "No extension"
          if (phone.extension_number) {
            extension = phone.extension_number.toString()
          } else if (phone.extension && phone.extension.number) {
            extension = phone.extension.number.toString()
          } else if (phone.phone_numbers && Array.isArray(phone.phone_numbers)) {
            const phoneNumber = phone.phone_numbers.find((p: any) => p.type === "extension")
            if (phoneNumber) {
              extension = phoneNumber.number
            }
          }

          // Extract phone number
          let phoneNumber = null
          if (phone.phone_number) {
            phoneNumber = phone.phone_number
          } else if (phone.phone_numbers && Array.isArray(phone.phone_numbers)) {
            const directNumber = phone.phone_numbers.find((p: any) => p.type === "direct")
            if (directNumber) {
              phoneNumber = directNumber.number
            }
          }

          const processedPhone = {
            id: phone.id,
            name: phone.name || phone.display_name || `Common Area ${phone.id}`,
            extension: extension,
            phone_number: phoneNumber,
            site: siteMap.get(phone.site_id) || "Unknown Site",
            site_id: phone.site_id,
            status: phone.status || "active",
            presence: "available",
            presence_status: null,
            type: "common_area",
            avatar_url: null,
            department: "Common Area",
            job_title: "Common Area Phone",
            location: phone.location || null,
          }

          processedCommonAreaPhones.push(processedPhone)
        } catch (error) {
          console.error("Error processing common area phone:", phone, error)
        }
      }
    }

    // Combine all users
    const allUsers = [...processedUsers, ...processedCommonAreaPhones]

    console.log("Final processed data:")
    console.log("- Processed users:", processedUsers.length)
    console.log("- Processed common area phones:", processedCommonAreaPhones.length)
    console.log("- Total users:", allUsers.length)
    console.log("=== FETCHING PHONE USERS (CACHED) END ===")

    return NextResponse.json({
      users: allUsers,
      total: allUsers.length,
      regular_users: processedUsers.length,
      common_area_phones: processedCommonAreaPhones.length,
      cached: true,
      cache_stats: await cache.getCacheStats(),
      debug: {
        raw_phone_users_count: Array.isArray(users) ? users.length : 0,
        raw_common_areas_count: Array.isArray(commonAreas) ? commonAreas.length : 0,
        sites_count: Array.isArray(sitesData) ? sitesData.length : 0,
        sample_user: processedUsers[0] || null,
        sample_common_area: processedCommonAreaPhones[0] || null,
      },
    })
  } catch (error) {
    console.error("Error in phone users route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
        users: [],
        total: 0,
        regular_users: 0,
        common_area_phones: 0,
      },
      { status: 500 },
    )
  }
}
