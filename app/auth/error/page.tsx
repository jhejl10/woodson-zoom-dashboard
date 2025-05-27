"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const description = searchParams.get("description")

  const getErrorMessage = () => {
    switch (error) {
      case "access_denied":
        return "You denied access to the application. Please try again and grant the necessary permissions."
      case "invalid_request":
        return "The request was invalid. Please try connecting again."
      case "missing_parameters":
        return "Required parameters were missing from the callback. Please try connecting again."
      case "callback_failed":
        return "Failed to complete the authentication process. Please check your configuration and try again."
      default:
        return "An unknown error occurred during authentication."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-red-600 text-white">
              <AlertCircle className="size-6" />
            </div>
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>There was a problem connecting to your Zoom account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{getErrorMessage()}</p>
            {description && <p className="text-xs text-red-500 mt-2">Details: {description}</p>}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Troubleshooting:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Make sure your Zoom app has the correct redirect URI configured</li>
              <li>• Verify that all required environment variables are set</li>
              <li>• Check that your Zoom app has the necessary scopes enabled</li>
              <li>• Ensure your Zoom app is published or you're using a development account</li>
            </ul>
          </div>

          <Link href="/" className="w-full">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
