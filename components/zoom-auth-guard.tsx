"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Loader2, Settings, AlertTriangle } from "lucide-react"
import { SafeErrorBoundary, useErrorHandlers } from "./safe-error-boundary"

interface ZoomAuthGuardProps {
  children: React.ReactNode
}

export function ZoomAuthGuard({ children }: ZoomAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authType, setAuthType] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Initialize error handlers
  useErrorHandlers()

  useEffect(() => {
    checkAuthStatus()
  }, [retryCount])

  const checkAuthStatus = async () => {
    try {
      console.log("Checking auth status...")

      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/auth/status?t=${timestamp}`, {
        // Add cache control headers
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      console.log("Auth status response:", response.status)

      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Auth status error response:", errorText)

        // If we get a 500 error, we'll show a bypass option
        if (response.status === 500) {
          setError(
            `Authentication service error (${response.status}). You can try to bypass authentication for debugging.`,
          )
          setIsAuthenticated(false)
          return
        }

        throw new Error(`Auth status error: ${response.status}`)
      }

      // Parse JSON response
      try {
        const data = await response.json()
        console.log("Auth status data:", data)
        setIsAuthenticated(data.authenticated)
        setAuthType(data.authType || "oauth")

        if (data.error) {
          setError(data.error)
        } else {
          setError(null)
        }
      } catch (jsonError) {
        console.error("Failed to parse auth status JSON:", jsonError)
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsAuthenticated(false)
      setError(error instanceof Error ? error.message : "Failed to check authentication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Login error: ${response.status}`)
      }

      try {
        const data = await response.json()
        if (data.success && data.authUrl) {
          // Redirect to Zoom OAuth
          window.location.href = data.authUrl
        } else {
          throw new Error(data.error || "Failed to get authorization URL")
        }
      } catch (jsonError) {
        throw new Error("Invalid response format from login endpoint")
      }
    } catch (error) {
      console.error("Error initiating login:", error)
      setError(error instanceof Error ? error.message : "Failed to connect to Zoom")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setRetryCount((prev) => prev + 1)
  }

  const handleBypass = () => {
    // This is only for debugging - in production, this would not be allowed
    console.warn("⚠️ Authentication bypassed for debugging")
    setIsAuthenticated(true)
    setAuthType("bypass")
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
            <CardDescription>Sign in with your Zoom account to access your phone data and manage calls</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

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

            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleRetry}>
                Retry Authentication Check
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              This will redirect you to Zoom's secure authentication page
            </p>

            <div className="mt-4 pt-4 border-t flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => (window.location.href = "/debug")} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Debug Configuration
              </Button>

              {error && error.includes("500") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBypass}
                  className="w-full text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Bypass Auth (Debug Only)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <SafeErrorBoundary>{children}</SafeErrorBoundary>
}
