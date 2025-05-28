"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

// OAuth configuration
const ZOOM_OAUTH_URL = "https://zoom.us/oauth/authorize"
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token"

export async function initiateZoomAuth() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.ZOOM_CLIENT_ID!,
    redirect_uri: process.env.ZOOM_REDIRECT_URI!,
  })

  redirect(`${ZOOM_OAUTH_URL}?${params.toString()}`)
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
      throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorText}`)
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

    const cookieStore = await cookies()
    cookieStore.set("zoom_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("Tokens stored successfully")
    console.log("=== END TOKEN EXCHANGE DEBUG ===")

    return tokens
  } catch (error) {
    console.error("Error handling Zoom callback:", error)
    throw error
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const tokens = cookieStore.get("zoom_tokens")?.value
  return !!tokens
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("zoom_tokens")
}
