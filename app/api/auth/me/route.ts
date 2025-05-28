import { NextResponse } from "next/server"
import { getCurrentUser, getCurrentUserPhoneProfile, getCurrentUserPresence } from "@/lib/zoom-api"

export async function GET() {
  try {
    // Get all user information in parallel
    const [userProfile, phoneProfile, presence] = await Promise.allSettled([
      getCurrentUser(),
      getCurrentUserPhoneProfile(),
      getCurrentUserPresence(),
    ])

    // Extract successful results
    const user = userProfile.status === "fulfilled" ? userProfile.value : null
    const phone = phoneProfile.status === "fulfilled" ? phoneProfile.value : null
    const presenceData = presence.status === "fulfilled" ? presence.value : null

    if (!user) {
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    // Combine all the data
    const combinedProfile = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name || `${user.first_name} ${user.last_name}`,
      profile_picture_url: user.profile_picture_url,
      timezone: user.timezone,
      type: user.type,
      status: user.status,

      // Phone-specific data
      phone: phone
        ? {
            extension_number: phone.extension_number,
            phone_numbers: phone.phone_numbers || [],
            site_id: phone.site_id,
            site_name: phone.site_name,
            calling_plans: phone.calling_plans || [],
            policy: phone.policy || {},
          }
        : null,

      // Presence data
      presence: presenceData
        ? {
            status: presenceData.status,
            status_message: presenceData.status_message,
            presence_status: presenceData.presence_status,
          }
        : {
            status: "available",
            status_message: "Available for calls",
            presence_status: "available",
          },

      // Debug info
      debug: {
        userProfileSuccess: userProfile.status === "fulfilled",
        phoneProfileSuccess: phoneProfile.status === "fulfilled",
        presenceSuccess: presence.status === "fulfilled",
        errors: {
          userProfile: userProfile.status === "rejected" ? userProfile.reason?.message : null,
          phoneProfile: phoneProfile.status === "rejected" ? phoneProfile.reason?.message : null,
          presence: presence.status === "rejected" ? presence.reason?.message : null,
        },
      },
    }

    return NextResponse.json(combinedProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
