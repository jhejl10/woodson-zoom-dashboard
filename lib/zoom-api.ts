"use server"

import { cookies } from "next/headers"

// Zoom Phone API configuration
const ZOOM_API_BASE_URL = "https://api.zoom.us/v2"
const ZOOM_PHONE_API_BASE_URL = "https://api.zoom.us/v2/phone"

interface ZoomTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

// Get stored tokens from cookies
async function getStoredTokens(): Promise<ZoomTokens | null> {
  const cookieStore = await cookies()
  const tokens = cookieStore.get("zoom_tokens")?.value

  if (!tokens) return null

  try {
    return JSON.parse(tokens)
  } catch {
    return null
  }
}

// Store tokens in cookies
async function storeTokens(tokens: ZoomTokens) {
  const cookieStore = await cookies()
  cookieStore.set("zoom_tokens", JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

// Refresh access token
async function refreshAccessToken(refreshToken: string): Promise<ZoomTokens | null> {
  try {
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const data = await response.json()
    const tokens: ZoomTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: Date.now() + data.expires_in * 1000,
    }

    await storeTokens(tokens)
    return tokens
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

// Get valid access token
async function getValidAccessToken(): Promise<string | null> {
  let tokens = await getStoredTokens()

  if (!tokens) {
    return null
  }

  // Check if token is expired (with 5 minute buffer)
  if (Date.now() >= tokens.expires_at - 5 * 60 * 1000) {
    tokens = await refreshAccessToken(tokens.refresh_token)
    if (!tokens) {
      return null
    }
  }

  return tokens.access_token
}

// Generic API request function
async function makeZoomAPIRequest(endpoint: string, options: RequestInit = {}) {
  const accessToken = await getValidAccessToken()

  if (!accessToken) {
    throw new Error("No valid access token available")
  }

  const response = await fetch(`${ZOOM_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Zoom API request failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

// Phone-specific API request function - EXPORTED
export async function makeZoomPhoneAPIRequest(endpoint: string, options: RequestInit = {}) {
  const accessToken = await getValidAccessToken()

  if (!accessToken) {
    throw new Error("No valid access token available")
  }

  const response = await fetch(`${ZOOM_PHONE_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Zoom Phone API request failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

// Get current authenticated user's profile
export async function getCurrentUser() {
  try {
    console.log("Fetching current user profile...")
    const response = await makeZoomAPIRequest("/users/me")
    console.log("Current user response:", response)
    return response
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

// Get current user's phone profile
export async function getCurrentUserPhoneProfile() {
  try {
    console.log("Fetching current user's phone profile...")
    const response = await makeZoomPhoneAPIRequest("/users/me")
    console.log("Current user phone profile response:", response)
    return response
  } catch (error) {
    console.error("Error fetching current user phone profile:", error)
    return null
  }
}

// Get current user's presence status - USES REGULAR USER ID
export async function getCurrentUserPresence() {
  try {
    console.log("Fetching current user's presence...")
    const response = await makeZoomAPIRequest("/users/me/presence_status")
    console.log("Current user presence response:", response)
    return response
  } catch (error) {
    console.error("Error fetching current user presence:", error)
    return null
  }
}

// User management functions
export async function getPhoneUsers() {
  try {
    console.log("Fetching phone users...")
    const response = await makeZoomPhoneAPIRequest("/users?page_size=100")
    console.log("Phone users API response:", response)

    if (response.users && Array.isArray(response.users)) {
      return response.users
    } else if (Array.isArray(response)) {
      return response
    } else {
      console.warn("Unexpected users response structure:", response)
      return []
    }
  } catch (error) {
    console.error("Error fetching phone users:", error)
    return []
  }
}

// Get user presence - USES REGULAR USER ID (not phone_user_id)
export async function getUserPresence(userId: string) {
  try {
    console.log(`Fetching presence for user ID: ${userId}`)
    // Use regular Zoom API for presence, not phone API
    const response = await makeZoomAPIRequest(`/users/${userId}/presence_status`)
    console.log(`Presence response for user ${userId}:`, response)
    return response
  } catch (error) {
    console.error(`Error fetching user presence for ${userId}:`, error)
    return null
  }
}

// Update user presence - USES REGULAR USER ID (not phone_user_id)
export async function updateUserPresence(userId: string, status: string, statusMessage?: string) {
  try {
    console.log(`Updating presence for user ID: ${userId} to status: ${status}`)
    const body: any = { status }
    if (statusMessage) {
      body.status_message = statusMessage
    }

    // Use regular Zoom API for presence updates, not phone API
    const response = await makeZoomAPIRequest(`/users/${userId}/presence_status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    console.log(`Presence update response for user ${userId}:`, response)
    return response
  } catch (error) {
    console.error(`Error updating user presence for ${userId}:`, error)
    throw error
  }
}

// Sites and locations
export async function getSites() {
  try {
    console.log("Fetching sites...")
    const response = await makeZoomPhoneAPIRequest("/sites?page_size=100")
    console.log("Sites API response:", response)
    return Array.isArray(response.sites) ? response.sites : []
  } catch (error) {
    console.error("Error fetching sites:", error)
    return []
  }
}

// Common area phones - USES PHONE API
export async function getCommonAreaPhones() {
  try {
    console.log("Fetching common area phones...")
    const response = await makeZoomPhoneAPIRequest("/common_areas?page_size=100")
    console.log("Common area phones response:", response)

    if (response.common_areas && Array.isArray(response.common_areas)) {
      return response.common_areas
    } else if (Array.isArray(response)) {
      return response
    } else {
      console.warn("Unexpected common areas response structure:", response)
      return []
    }
  } catch (error) {
    console.error("Error fetching common area phones:", error)
    return []
  }
}

// Get phone devices - USES PHONE API
export async function getPhoneDevices() {
  try {
    console.log("Fetching phone devices...")
    const response = await makeZoomPhoneAPIRequest("/devices?page_size=100")
    console.log("Phone devices response:", response)
    return Array.isArray(response.devices) ? response.devices : []
  } catch (error) {
    console.error("Error fetching phone devices:", error)
    return []
  }
}

// Check if user's desk phone is online - USES PHONE_USER_ID
export async function checkDeskPhoneStatus(phoneUserId: string) {
  try {
    console.log(`Checking desk phone status for phone user ID ${phoneUserId}...`)
    const response = await makeZoomPhoneAPIRequest(`/users/${phoneUserId}/devices?page_size=100`)
    console.log(`Desk phone status for phone user ${phoneUserId}:`, response)

    if (response.devices && Array.isArray(response.devices)) {
      const onlineDevice = response.devices.find(
        (device: any) => device.type === "desk_phone" && device.status === "online",
      )
      return !!onlineDevice
    }
    return false
  } catch (error) {
    console.error(`Error checking desk phone status for phone user ${phoneUserId}:`, error)
    return false
  }
}

// Call management functions - USE PHONE_USER_ID for phone operations
export async function getCallHistory(phoneUserId?: string, from?: string, to?: string) {
  try {
    const params = new URLSearchParams()
    if (phoneUserId) params.append("user_id", phoneUserId) // This should be phone_user_id
    if (from) params.append("from", from)
    if (to) params.append("to", to)
    params.append("page_size", "50")

    const response = await makeZoomPhoneAPIRequest(`/call_logs?${params.toString()}`)
    return Array.isArray(response.call_logs) ? response.call_logs : []
  } catch (error) {
    console.error("Error fetching call history:", error)
    return []
  }
}

// Phone operations use phone_user_id
export async function makeCall(callerId: string, callee: string) {
  try {
    const response = await makeZoomPhoneAPIRequest("/calls", {
      method: "POST",
      body: JSON.stringify({
        caller_id: callerId, // Should be phone_user_id
        callee: callee,
      }),
    })
    return response
  } catch (error) {
    console.error("Error making call:", error)
    throw error
  }
}

export async function transferCall(callId: string, transferTo: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/calls/${callId}/transfer`, {
      method: "PATCH",
      body: JSON.stringify({
        transfer_to: transferTo,
      }),
    })
    return response
  } catch (error) {
    console.error("Error transferring call:", error)
    throw error
  }
}

export async function endCall(callId: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/calls/${callId}`, {
      method: "DELETE",
    })
    return response
  } catch (error) {
    console.error("Error ending call:", error)
    throw error
  }
}

export async function holdCall(callId: string, hold: boolean) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/calls/${callId}/hold`, {
      method: "PATCH",
      body: JSON.stringify({
        hold: hold,
      }),
    })
    return response
  } catch (error) {
    console.error("Error holding/unholding call:", error)
    throw error
  }
}

export async function muteCall(callId: string, mute: boolean) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/calls/${callId}/mute`, {
      method: "PATCH",
      body: JSON.stringify({
        mute: mute,
      }),
    })
    return response
  } catch (error) {
    console.error("Error muting/unmuting call:", error)
    throw error
  }
}

// Call queue functions
export async function getCallQueues() {
  try {
    const response = await makeZoomPhoneAPIRequest("/call_queues")
    return Array.isArray(response.call_queues) ? response.call_queues : []
  } catch (error) {
    console.error("Error fetching call queues:", error)
    return []
  }
}

export async function getCallQueueMembers(queueId: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/call_queues/${queueId}/members`)
    return Array.isArray(response.members) ? response.members : []
  } catch (error) {
    console.error("Error fetching call queue members:", error)
    return []
  }
}

// Voicemail functions - USE PHONE_USER_ID
export async function getVoicemails(phoneUserId?: string) {
  try {
    const params = new URLSearchParams()
    if (phoneUserId) params.append("user_id", phoneUserId) // Should be phone_user_id
    params.append("page_size", "50")

    const response = await makeZoomPhoneAPIRequest(`/voicemails?${params.toString()}`)
    return Array.isArray(response.voicemails) ? response.voicemails : []
  } catch (error) {
    console.error("Error fetching voicemails:", error)
    return []
  }
}

export async function markVoicemailAsRead(voicemailId: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/voicemails/${voicemailId}`, {
      method: "PATCH",
      body: JSON.stringify({
        is_read: true,
      }),
    })
    return response
  } catch (error) {
    console.error("Error marking voicemail as read:", error)
    throw error
  }
}

// SMS functions - USE PHONE_USER_ID
export async function getSMSMessages(phoneUserId?: string) {
  try {
    const params = new URLSearchParams()
    if (phoneUserId) params.append("user_id", phoneUserId) // Should be phone_user_id
    params.append("page_size", "50")

    const response = await makeZoomPhoneAPIRequest(`/sms?${params.toString()}`)
    return Array.isArray(response.messages) ? response.messages : []
  } catch (error) {
    console.error("Error fetching SMS messages:", error)
    return []
  }
}

export async function sendSMS(from: string, to: string, message: string) {
  try {
    const response = await makeZoomPhoneAPIRequest("/sms", {
      method: "POST",
      body: JSON.stringify({
        from: from,
        to: to,
        message: message,
      }),
    })
    return response
  } catch (error) {
    console.error("Error sending SMS:", error)
    throw error
  }
}

// Active calls
export async function getActiveCalls() {
  try {
    const response = await makeZoomPhoneAPIRequest("/calls")
    return Array.isArray(response.calls) ? response.calls : []
  } catch (error) {
    console.error("Error fetching active calls:", error)
    return []
  }
}

// Get user phone settings - USES PHONE_USER_ID
export async function getUserPhoneSettings(phoneUserId: string) {
  try {
    console.log(`Fetching phone settings for phone user ID: ${phoneUserId}`)
    const response = await makeZoomPhoneAPIRequest(`/users/${phoneUserId}`)
    console.log(`Phone settings for phone user ${phoneUserId}:`, response)
    return response
  } catch (error) {
    console.error(`Error fetching phone settings for phone user ${phoneUserId}:`, error)
    return null
  }
}
