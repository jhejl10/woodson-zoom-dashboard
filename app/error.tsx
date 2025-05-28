"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-red-700">
                <p>
                  <strong>Error:</strong> {error.message || "An unexpected error occurred"}
                </p>
                {error.digest && <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => reset()} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try again
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
                  Reload page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
