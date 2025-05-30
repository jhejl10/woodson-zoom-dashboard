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
    const [phoneUsersResult, sitesResult, commonAreaPhonesResult] = await Promise.allSettled([
      cache.getUsers(),
      cache.getSitesData(),
      cache.getCommonAreas(),
    ])

    // Extract results with fallbacks
    const phoneUsers = phoneUsersResult.status === "fulfilled" ? phoneUsersResult.value : []
    const sites = sitesResult.status === "fulfilled" ? sitesResult.value : []
    const commonAreaPhones = commonAreaPhonesResult.status === "fulfilled" ? commonAreaPhonesResult.value : []

    console.log("Raw API responses:")
    console.log("- Phone users:", phoneUsers)
    console.log("- Sites:", sites)
    console.log("- Common area phones:", commonAreaPhones)

    // Create a site lookup map
    const siteMap = new Map()
    if (Array.isArray(sites)) {
      sites.forEach((site: any) => {
        if (site && site.id) {
          siteMap.set(site.id, site.name || "Unknown Site")
        }
      })
    }
    console.log("Site map:", Object.fromEntries(siteMap))

    // Process regular users
    const processedUsers: any[] = []
    if (Array.isArray(phoneUsers)) {
      for (const user of phoneUsers) {
        try {
          if (!user || typeof user !== "object") {
            console.warn("Invalid user object:", user)
            continue
          }

          console.log("Processing user:", user)

          // Extract name properly - prioritize first_name + last_name
          let displayName = "Unknown User"
          if (user.first_name || user.last_name) {
            displayName = `${user.first_name || ""} ${user.last_name || ""}`.trim()
          } else if (user.display_name) {
            displayName = user.display_name
          } else if (user.name) {
            displayName = user.name
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
          let presenceStatus = "available" // Default to available instead of unknown
          try {
            presence = await cache.getUserPresenceData(user.id)
            if (presence && presence.status) {
              presenceStatus = presence.status
            }

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
            presenceStatus = "available" // Default to available
          }

          const processedUser = {
            id: user.id,
            name: displayName,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            extension: extension,
            phone_number: phoneNumber,
            site: siteMap.get(user.site_id) || "Main Office", // Better default
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
          console.log(
            `Processed user: ${processedUser.name} - Ext: ${processedUser.extension} - Site: ${processedUser.site}`,
          )
        } catch (error) {
          console.error("Error processing user:", user, error)
        }
      }
    }

    // Process common area phones
    const processedCommonAreaPhones: any[] = []
    if (Array.isArray(commonAreaPhones)) {
      for (const phone of commonAreaPhones) {
        try {
          if (!phone || typeof phone !== "object") {
            console.warn("Invalid common area phone object:", phone)
            continue
          }

          console.log("Processing common area phone:", phone)

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
            site: siteMap.get(phone.site_id) || "Main Office",
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
          console.log(
            `Processed common area: ${processedPhone.name} - Ext: ${processedPhone.extension} - Site: ${processedPhone.site}`,
          )
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
        raw_phone_users_count: Array.isArray(phoneUsers) ? phoneUsers.length : 0,
        raw_common_areas_count: Array.isArray(commonAreaPhones) ? commonAreaPhones.length : 0,
        sites_count: Array.isArray(sites) ? sites.length : 0,
        sample_user: processedUsers[0] || null,
        sample_common_area: processedCommonAreaPhones[0] || null,
        raw_samples: {
          raw_user: phoneUsers[0] || null,
          raw_common_area: commonAreaPhones[0] || null,
          raw_site: sites[0] || null,
        },
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
