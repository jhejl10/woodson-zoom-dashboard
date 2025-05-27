import { NextResponse } from "next/server"
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

export async function GET() {
  try {
    const tokens = await getStoredTokens()

    if (!tokens) {
      return NextResponse.json({
        error: "No authentication tokens found",
        authenticated: false,
      })
    }

    const testResults = []

    // Test 1: Basic user info (should work with minimal scopes)
    try {
      const userResponse = await fetch("https://api.zoom.us/v2/users/me", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      })

      testResults.push({
        endpoint: "/users/me",
        status: userResponse.status,
        success: userResponse.ok,
        data: userResponse.ok ? await userResponse.json() : await userResponse.text(),
      })
    } catch (error) {
      testResults.push({
        endpoint: "/users/me",
        status: "error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 2: Phone users endpoint (the one that's failing)
    try {
      const phoneResponse = await fetch("https://api.zoom.us/v2/phone/users", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      })

      testResults.push({
        endpoint: "/phone/users",
        status: phoneResponse.status,
        success: phoneResponse.ok,
        data: phoneResponse.ok ? await phoneResponse.json() : await phoneResponse.text(),
      })
    } catch (error) {
      testResults.push({
        endpoint: "/phone/users",
        status: "error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 3: Account info
    try {
      const accountResponse = await fetch("https://api.zoom.us/v2/accounts/me", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      })

      testResults.push({
        endpoint: "/accounts/me",
        status: accountResponse.status,
        success: accountResponse.ok,
        data: accountResponse.ok ? await accountResponse.json() : await accountResponse.text(),
      })
    } catch (error) {
      testResults.push({
        endpoint: "/accounts/me",
        status: "error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 4: Phone settings (to check if phone is enabled)
    try {
      const settingsResponse = await fetch("https://api.zoom.us/v2/phone/settings", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      })

      testResults.push({
        endpoint: "/phone/settings",
        status: settingsResponse.status,
        success: settingsResponse.ok,
        data: settingsResponse.ok ? await settingsResponse.json() : await settingsResponse.text(),
      })
    } catch (error) {
      testResults.push({
        endpoint: "/phone/settings",
        status: "error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json({
      authenticated: true,
      tokenInfo: {
        hasToken: !!tokens.access_token,
        tokenPreview: tokens.access_token?.substring(0, 20) + "...",
        expiresAt: new Date(tokens.expires_at).toISOString(),
      },
      testResults,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
