"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Copy } from "lucide-react"

export default function EndpointsDebugPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runEndpointTests = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/zoom/test-endpoints")
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: "Failed to run endpoint tests" })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusBadge = (result: any) => {
    if (result.success) {
      return (
        <Badge variant="default" className="bg-green-500">
          Success
        </Badge>
      )
    } else if (result.status >= 400 && result.status < 500) {
      return <Badge variant="destructive">Client Error ({result.status})</Badge>
    } else if (result.status >= 500) {
      return <Badge variant="destructive">Server Error ({result.status})</Badge>
    } else {
      return <Badge variant="secondary">Failed</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zoom API Endpoint Testing</CardTitle>
          <CardDescription>Test individual Zoom API endpoints to diagnose issues</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runEndpointTests} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Test All Endpoints
          </Button>

          {testResults && (
            <div className="mt-6 space-y-4">
              {/* Authentication Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {testResults.authenticated ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    Authentication Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.authenticated ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        Status: <Badge variant="default">Authenticated</Badge>
                      </div>
                      <div>Token: {testResults.tokenInfo?.tokenPreview}</div>
                      <div>Expires: {testResults.tokenInfo?.expiresAt}</div>
                    </div>
                  ) : (
                    <div className="text-red-600">Not authenticated - please log in first</div>
                  )}
                </CardContent>
              </Card>

              {/* Endpoint Test Results */}
              {testResults.testResults && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endpoint Test Results</h3>
                  {testResults.testResults.map((result: any, index: number) => (
                    <Card key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{result.endpoint}</span>
                          {getStatusBadge(result)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <strong>Status:</strong> {result.status}
                          </div>

                          {result.error && (
                            <div className="text-sm text-red-600">
                              <strong>Error:</strong> {result.error}
                            </div>
                          )}

                          {result.data && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <strong className="text-sm">Response Data:</strong>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base text-blue-600">Troubleshooting Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {testResults.testResults?.some((r: any) => r.endpoint === "/phone/users" && !r.success) && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Phone API not accessible:</strong> This usually means:
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• Your Zoom account doesn't have Zoom Phone enabled</li>
                            <li>• Your app doesn't have the required phone scopes</li>
                            <li>• You need a Zoom Phone license</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {testResults.testResults?.some((r: any) => r.status === 401) && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Authentication issues:</strong> Token may be expired or invalid
                        </div>
                      </div>
                    )}

                    {testResults.testResults?.some((r: any) => r.status === 403) && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Permission denied:</strong> Your app may not have the required scopes
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" onClick={() => window.open("https://marketplace.zoom.us/develop/create", "_blank")}>
            Open Zoom Marketplace
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/debug")}>
            Back to Main Debug
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
