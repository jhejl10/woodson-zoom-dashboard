import { NextResponse } from "next/server"
import { getPhoneUsers, getSites, getCommonAreaPhones, getUserPresence } from "@/lib/zoom-api"

export async function GET() {
  try {
    console.log("=== FETCHING PHONE USERS START ===")

    // Fetch all data in parallel with better error handling
    const [phoneUsersResult, sitesResult, commonAreaPhonesResult] = await Promise.allSettled([
      getPhoneUsers(),
      getSites(),
      getCommonAreaPhones(),
    ])

    // Extract results with fallbacks
    const phoneUsers = phoneUsersResult.status === "fulfilled" ? phoneUsersResult.value : []
    const sites = sitesResult.status === "fulfilled" ? sitesResult.value : []
    const commonAreaPhones = commonAreaPhonesResult.status === "fulfilled" ? commonAreaPhonesResult.value : []

    console.log("Fetched raw data:")
    console.log("- Phone users:", Array.isArray(phoneUsers) ? phoneUsers.length : "not an array")
    console.log("- Sites:", Array.isArray(sites) ? sites.length : "not an array")
    console.log("- Common area phones:", Array.isArray(commonAreaPhones) ? commonAreaPhones.length : "not an array")

    // Create a site lookup map
    const siteMap = new Map()
    if (Array.isArray(sites)) {
      sites.forEach((site: any) => {
        if (site && site.id) {
          siteMap.set(site.id, site.name || "Unknown Site")
        }
      })
    }

    // Process regular users with proper extension extraction
    const processedUsers: any[] = []
    if (Array.isArray(phoneUsers)) {
      for (const user of phoneUsers) {
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

          // Try to get presence status
          let presence = null
          try {
            presence = await getUserPresence(user.id)
          } catch (error) {
            console.log(`Could not fetch presence for user ${user.id}`)
          }

          const processedUser = {
            id: user.id,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Unknown User",
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            extension: extension,
            phone_number: phoneNumber,
            site: siteMap.get(user.site_id) || "Unknown Site",
            site_id: user.site_id,
            status: user.status || "active",
            presence: presence?.status || "unknown",
            presence_status: presence?.status_message || null,
            type: "user",
            avatar_url: user.avatar_url || null,
            department: user.department || null,
            job_title: user.job_title || null,
            location: user.location || null,
          }

          processedUsers.push(processedUser)
          console.log(`Processed user: ${processedUser.name} - Ext: ${processedUser.extension}`)
        } catch (error) {
          console.error("Error processing user:", user, error)
        }
      }
    }

    // Process common area phones with proper extension extraction
    const processedCommonAreaPhones: any[] = []
    if (Array.isArray(commonAreaPhones)) {
      for (const phone of commonAreaPhones) {
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
            presence: "available", // Common area phones are typically always available
            presence_status: null,
            type: "common_area",
            avatar_url: null,
            department: "Common Area",
            job_title: "Common Area Phone",
            location: phone.location || null,
          }

          processedCommonAreaPhones.push(processedPhone)
          console.log(`Processed common area: ${processedPhone.name} - Ext: ${processedPhone.extension}`)
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
    console.log("=== FETCHING PHONE USERS END ===")

    return NextResponse.json({
      users: allUsers,
      total: allUsers.length,
      regular_users: processedUsers.length,
      common_area_phones: processedCommonAreaPhones.length,
      debug: {
        raw_phone_users_count: Array.isArray(phoneUsers) ? phoneUsers.length : 0,
        raw_common_areas_count: Array.isArray(commonAreaPhones) ? commonAreaPhones.length : 0,
        sites_count: Array.isArray(sites) ? sites.length : 0,
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
