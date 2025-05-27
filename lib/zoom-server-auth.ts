"use server"

interface ServerTokens {
  access_token: string
  expires_at: number
}

// Get server-to-server access token
async function getServerAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get server token: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting server access token:", error)
    return null
  }
}

// Check if we should use server-to-server auth
export async function useServerAuth(): Promise<boolean> {
  return process.env.ZOOM_AUTH_TYPE === "server-to-server"
}

// Server-to-server API request
export async function makeServerZoomAPIRequest(endpoint: string, options: RequestInit = {}) {
  const accessToken = await getServerAccessToken()

  if (!accessToken) {
    throw new Error("Failed to get server access token")
  }

  const response = await fetch(`https://api.zoom.us/v2${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Zoom API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
