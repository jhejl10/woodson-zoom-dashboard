"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { patchArrayMethods, setupGlobalErrorHandler } from "@/lib/error-interceptors"

interface SafeErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface SafeErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class SafeErrorBoundary extends React.Component<SafeErrorBoundaryProps, SafeErrorBoundaryState> {
  constructor(props: SafeErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): SafeErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by SafeErrorBoundary:", error, errorInfo)
  }

  componentDidMount() {
    // Apply patches when the component mounts
    try {
      patchArrayMethods()
      setupGlobalErrorHandler()
    } catch (error) {
      console.error("Error setting up error handlers:", error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-700 dark:text-red-300">
              <p>
                <strong>Error:</strong> {this.state.error?.message || "Unknown error"}
              </p>
              <p className="mt-2">The application encountered an error. Please try refreshing the page.</p>
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook to initialize error handlers in functional components
export function useErrorHandlers() {
  useEffect(() => {
    try {
      patchArrayMethods()
      setupGlobalErrorHandler()
    } catch (error) {
      console.error("Error setting up error handlers:", error)
    }
  }, [])
}
