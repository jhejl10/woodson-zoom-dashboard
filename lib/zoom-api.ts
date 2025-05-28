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

// Get current user's presence status
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
    const response = await makeZoomPhoneAPIRequest("/users?page_size=300")
    console.log("Phone users response:", response)

    // Handle the response structure properly
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

export async function getUserPresence(userId: string) {
  try {
    const response = await makeZoomAPIRequest(`/users/${userId}/presence_status`)
    return response
  } catch (error) {
    console.error("Error fetching user presence:", error)
    return null
  }
}

export async function updateUserPresence(userId: string, status: string, statusMessage?: string) {
  try {
    const body: any = { status }
    if (statusMessage) {
      body.status_message = statusMessage
    }

    const response = await makeZoomAPIRequest(`/users/${userId}/presence_status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    return response
  } catch (error) {
    console.error("Error updating user presence:", error)
    throw error
  }
}

// Call management functions
export async function getCallHistory(userId?: string, from?: string, to?: string) {
  try {
    const params = new URLSearchParams()
    if (userId) params.append("user_id", userId)
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

export async function makeCall(callerId: string, callee: string) {
  try {
    const response = await makeZoomPhoneAPIRequest("/calls", {
      method: "POST",
      body: JSON.stringify({
        caller_id: callerId,
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

// Voicemail functions
export async function getVoicemails(userId?: string) {
  try {
    const params = new URLSearchParams()
    if (userId) params.append("user_id", userId)
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

// SMS functions
export async function getSMSMessages(userId?: string) {
  try {
    const params = new URLSearchParams()
    if (userId) params.append("user_id", userId)
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

// Sites and locations
export async function getSites() {
  try {
    const response = await makeZoomPhoneAPIRequest("/sites?page_size=100")
    console.log("Sites response:", response)
    return Array.isArray(response.sites) ? response.sites : []
  } catch (error) {
    console.error("Error fetching sites:", error)
    return []
  }
}

// Common area phones - FIXED ENDPOINT
export async function getCommonAreaPhones() {
  try {
    console.log("Fetching common area phones from /phone/common_areas...")

    // Try the correct endpoint first
    try {
      const response = await makeZoomPhoneAPIRequest("/common_areas?page_size=300")
      console.log("Common area phones response from /common_areas:", response)

      // Handle various response structures
      if (response.common_areas && Array.isArray(response.common_areas)) {
        return response.common_areas
      } else if (Array.isArray(response)) {
        return response
      }
    } catch (error) {
      console.error("Error with /common_areas endpoint, trying fallback:", error)
    }

    // Fallback to alternative endpoint
    try {
      const response = await makeZoomPhoneAPIRequest("/common_area_phones?page_size=300")
      console.log("Common area phones response from /common_area_phones:", response)

      if (response.common_area_phones && Array.isArray(response.common_area_phones)) {
        return response.common_area_phones
      } else if (Array.isArray(response)) {
        return response
      }
    } catch (error) {
      console.error("Error with fallback endpoint:", error)
    }

    console.warn("Could not retrieve common area phones from any endpoint")
    return []
  } catch (error) {
    console.error("Error fetching common area phones:", error)
    return []
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

export async function getUserPhoneSettings(userId: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/users/${userId}`)
    console.log(`Phone settings for user ${userId}:`, response)
    return response
  } catch (error) {
    console.error(`Error fetching phone settings for user ${userId}:`, error)
    return null
  }
}
