import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/zoom-auth"
import { useServerAuth, makeServerZoomAPIRequest } from "@/lib/zoom-server-auth"

export async function GET() {
  let isServerAuth = false
  try {
    isServerAuth = await useServerAuth()

    if (isServerAuth) {
      // Test server-to-server auth
      try {
        await makeServerZoomAPIRequest("/users/me")
        return NextResponse.json({
          authenticated: true,
          authType: "server-to-server",
        })
      } catch (error) {
        return NextResponse.json({
          authenticated: false,
          authType: "server-to-server",
          error: "Server auth failed",
        })
      }
    } else {
      // Use regular OAuth
      const authenticated = await isAuthenticated()
      return NextResponse.json({
        authenticated,
        authType: "oauth",
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        authType: "oauth",
      },
      { status: 500 },
    )
  }
}
