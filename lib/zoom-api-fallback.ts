"use server"

import { cookies } from "next/headers"

async function getStoredTokens() {
  const cookieStore = await cookies()
  const tokens = cookieStore.get("zoom_tokens")?.value
  if (!tokens) return null
  try {
    return JSON.parse(tokens)
  } catch {
    return null
  }
}

async function makeZoomAPIRequest(endpoint: string, options: RequestInit = {}) {
  const tokens = await getStoredTokens()
  if (!tokens) {
    throw new Error("No authentication tokens available")
  }

  const response = await fetch(`https://api.zoom.us/v2${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.status} - ${errorText}`)
  }

  return response.json()
}

// Check if user has Zoom Phone access
export async function checkZoomPhoneAccess() {
  try {
    // Try to access phone settings first (lighter endpoint)
    await makeZoomAPIRequest("/phone/settings")
    return { hasAccess: true, error: null }
  } catch (error) {
    return {
      hasAccess: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get basic user info (this should always work)
export async function getBasicUserInfo() {
  try {
    const user = await makeZoomAPIRequest("/users/me")
    return { success: true, user, error: null }
  } catch (error) {
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get account info
export async function getAccountInfo() {
  try {
    const account = await makeZoomAPIRequest("/accounts/me")
    return { success: true, account, error: null }
  } catch (error) {
    return {
      success: false,
      account: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Mock data for when Zoom Phone isn't available
export async function getMockPhoneData() {
  return {
    users: [
      {
        id: "demo_user_1",
        email: "demo@company.com",
        first_name: "Demo",
        last_name: "User",
        display_name: "Demo User",
        phone_user: {
          extension_number: "1001",
          phone_numbers: [{ number: "+1 (555) 123-4567", type: "direct" }],
          status: "active",
          site_id: "demo_site_1",
        },
        type: "user",
        site: "Demo Office",
        presence: "available",
        statusMessage: "Available for calls",
      },
    ],
    queues: [
      {
        id: "demo_queue_1",
        name: "Demo Support Queue",
        site: "Demo Office",
        waitingCalls: 0,
        longestWait: "0:00",
        averageWait: "0:00",
        agents: [],
        totalAgents: 1,
        availableAgents: 1,
      },
    ],
    callLogs: [],
    voicemails: [],
    recordings: [],
  }
}
