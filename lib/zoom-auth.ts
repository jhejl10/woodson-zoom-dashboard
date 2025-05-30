"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

// OAuth configuration
const ZOOM_OAUTH_URL = "https://zoom.us/oauth/authorize"
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token"

interface ZoomTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

// Get stored tokens from cookies
async function getStoredTokens(): Promise<ZoomTokens | null> {
  try {
    const cookieStore = cookies()
    const tokens = cookieStore.get("zoom_tokens")?.value

    if (!tokens) return null

    return JSON.parse(tokens)
  } catch (error) {
    console.error("Error getting stored tokens:", error)
    return null
  }
}

// Store tokens in cookies
async function storeTokens(tokens: ZoomTokens) {
  try {
    const cookieStore = cookies()
    cookieStore.set("zoom_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } catch (error) {
    console.error("Error storing tokens:", error)
  }
}

// Refresh access token
async function refreshAccessToken(refreshToken: string): Promise<ZoomTokens | null> {
  try {
    const response = await fetch(ZOOM_TOKEN_URL, {
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
      throw new Error(`Failed to refresh token: ${response.status}`)
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

// Get valid access token - REQUIRED EXPORT
export async function getValidAccessToken(): Promise<string | null> {
  try {
    let tokens = await getStoredTokens()

    if (!tokens) {
      console.log("No tokens found")
      return null
    }

    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= tokens.expires_at - 5 * 60 * 1000) {
      console.log("Token expired, refreshing...")
      tokens = await refreshAccessToken(tokens.refresh_token)
      if (!tokens) {
        console.log("Failed to refresh token")
        return null
      }
    }

    return tokens.access_token
  } catch (error) {
    console.error("Error getting valid access token:", error)
    return null
  }
}

export async function initiateZoomAuth() {
  try {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.ZOOM_CLIENT_ID!,
      redirect_uri: process.env.ZOOM_REDIRECT_URI!,
    })

    redirect(`${ZOOM_OAUTH_URL}?${params.toString()}`)
  } catch (error) {
    console.error("Error initiating Zoom auth:", error)
    throw error
  }
}

export async function handleZoomCallback(code: string) {
  try {
    console.log("=== TOKEN EXCHANGE DEBUG ===")
    console.log("Exchanging code for tokens...")
    console.log("Code length:", code.length)
    console.log("Code preview:", code.substring(0, 20) + "...")

    const response = await fetch(ZOOM_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.ZOOM_REDIRECT_URI!,
      }),
    })

    console.log("Token response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Token exchange failed:", response.status, errorText)
      throw new Error(`Failed to exchange code for tokens: ${response.status}`)
    }

    const data = await response.json()
    console.log("Token exchange successful!")
    console.log("Response data keys:", Object.keys(data))

    // Store tokens
    const tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    }

    await storeTokens(tokens)

    console.log("Tokens stored successfully")
    console.log("=== END TOKEN EXCHANGE DEBUG ===")

    return tokens
  } catch (error) {
    console.error("Error handling Zoom callback:", error)
    throw error
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const tokens = cookieStore.get("zoom_tokens")?.value
    return !!tokens
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export async function logout() {
  try {
    const cookieStore = cookies()
    cookieStore.delete("zoom_tokens")
  } catch (error) {
    console.error("Error during logout:", error)
  }
}
