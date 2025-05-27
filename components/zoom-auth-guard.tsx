"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Loader2, Settings } from "lucide-react"

interface ZoomAuthGuardProps {
  children: React.ReactNode
}

export function ZoomAuthGuard({ children }: ZoomAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authType, setAuthType] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status")
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
      setAuthType(data.authType || "oauth")
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.authUrl) {
        // Store state in sessionStorage for verification
        if (data.state) {
          sessionStorage.setItem("zoom_oauth_state", data.state)
        }

        // Redirect to Zoom OAuth
        window.location.href = data.authUrl
      } else {
        throw new Error(data.error || "Failed to get authorization URL")
      }
    } catch (error) {
      console.error("Error initiating login:", error)
      setError(error instanceof Error ? error.message : "Failed to connect to Zoom")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {isAuthenticated === null ? "Checking authentication..." : "Connecting to Zoom..."}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Phone className="size-6" />
              </div>
            </div>
            <CardTitle>Connect to Zoom Phone</CardTitle>
            <CardDescription>
              {authType === "server-to-server"
                ? "Server-to-server authentication configured"
                : "Sign in with your Zoom account to access your phone data and manage calls"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {authType === "server-to-server" ? (
              <div className="text-center space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-600">
                    Server-to-server authentication is configured but not working. Check your app credentials and make
                    sure the app is activated.
                  </p>
                </div>
                <Button variant="outline" onClick={() => (window.location.href = "/debug")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Debug Configuration
                </Button>
              </div>
            ) : (
              <>
                <Button onClick={handleLogin} className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Zoom Account"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  This will redirect you to Zoom's secure authentication page
                </p>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/debug")}
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Debug Configuration
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
