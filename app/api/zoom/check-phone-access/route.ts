import { NextResponse } from "next/server"
import { checkZoomPhoneAccess, getBasicUserInfo, getAccountInfo } from "@/lib/zoom-api-fallback"

export async function GET() {
  try {
    // First check if we can get basic user info
    const userInfo = await getBasicUserInfo()
    if (!userInfo.success) {
      return NextResponse.json({
        hasAccess: false,
        error: `Authentication failed: ${userInfo.error}`,
        userInfo: null,
        accountInfo: null,
      })
    }

    // Then check account info
    const accountInfo = await getAccountInfo()

    // Finally check phone access
    const phoneAccess = await checkZoomPhoneAccess()

    return NextResponse.json({
      hasAccess: phoneAccess.hasAccess,
      error: phoneAccess.error,
      userInfo: userInfo.user,
      accountInfo: accountInfo.account,
      recommendations: phoneAccess.hasAccess
        ? []
        : [
            "Contact your Zoom administrator to enable Zoom Phone",
            "Verify your Zoom app has phone:read and phone:write scopes",
            "Check if your organization has Zoom Phone licenses available",
          ],
    })
  } catch (error) {
    return NextResponse.json(
      {
        hasAccess: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userInfo: null,
        accountInfo: null,
      },
      { status: 500 },
    )
  }
}
