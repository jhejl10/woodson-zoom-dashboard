"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/test-zoom")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: "Failed to run test" })
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    try {
      const response = await fetch("/api/auth/login", { method: "POST" })
      const data = await response.json()

      if (data.success && data.authUrl) {
        window.open(data.authUrl, "_blank")
      } else {
        alert(`Auth test failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Auth test failed: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zoom OAuth Debug Tool</CardTitle>
          <CardDescription>Test your Zoom app configuration and OAuth flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTest} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Run Configuration Test
            </Button>
            <Button variant="outline" onClick={testAuth}>
              Test Auth Flow
            </Button>
          </div>

          {testResult && (
            <div className="space-y-4">
              {/* Environment Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Environment Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {testResult.environment?.hasClientId ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Client ID: {testResult.environment?.clientIdPreview}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResult.environment?.hasClientSecret ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Client Secret: {"*".repeat(testResult.environment?.secretLength || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResult.redirectUriCheck?.isHttps ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span>Redirect URI: {testResult.redirectUriCheck?.fullUri}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* App Info */}
              {testResult.appInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Zoom App Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>App Name: {testResult.appInfo.app_name}</div>
                      <div>App Type: {testResult.appInfo.app_type}</div>
                      <div className="flex items-center gap-2">
                        Published:
                        {testResult.appInfo.published ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="destructive">No</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* App Error */}
              {testResult.appError && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-base text-red-600">App Configuration Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-600">{testResult.appError}</p>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {testResult.recommendations?.length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-base text-yellow-600">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {testResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manual Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>
              <strong>Check Zoom App Status:</strong> Go to{" "}
              <a
                href="https://marketplace.zoom.us/develop/create"
                target="_blank"
                className="text-blue-600 underline"
                rel="noreferrer"
              >
                Zoom Marketplace
              </a>{" "}
              and verify your app is activated/published
            </li>
            <li>
              <strong>Verify Redirect URI:</strong> In your Zoom app settings, ensure the redirect URI exactly matches:
              <code className="bg-gray-100 px-1 rounded ml-1">{testResult?.redirectUriCheck?.fullUri}</code>
            </li>
            <li>
              <strong>Check Scopes:</strong> Ensure your app has these scopes enabled:
              <ul className="ml-4 mt-1 space-y-1">
                <li>• user:read</li>
                <li>• phone:read</li>
                <li>• phone:write (if needed)</li>
              </ul>
            </li>
            <li>
              <strong>Account Type:</strong> Make sure you're using the correct account type (Basic, Pro, Business,
              Enterprise)
            </li>
            <li>
              <strong>App Type:</strong> For development, use "OAuth" app type, not "Server-to-Server OAuth"
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
