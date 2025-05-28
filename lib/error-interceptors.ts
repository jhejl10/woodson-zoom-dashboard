"use client"

// This file contains global error interceptors to prevent common errors

// Safely patch Array.prototype.forEach to prevent "Cannot read properties of undefined" errors
export function patchArrayMethods() {
  try {
    // Store the original forEach method
    const originalForEach = Array.prototype.forEach

    // Replace with a safe version that checks for undefined/null
    Array.prototype.forEach = function safeForEach(callback, thisArg) {
      try {
        if (this === undefined || this === null) {
          console.warn("Prevented forEach call on undefined/null")
          return
        }
        return originalForEach.call(this, callback, thisArg)
      } catch (error) {
        console.error("Error in patched forEach:", error)
        return
      }
    }

    // Store the original map method
    const originalMap = Array.prototype.map

    // Replace with a safe version that checks for undefined/null
    Array.prototype.map = function safeMap(callback, thisArg) {
      try {
        if (this === undefined || this === null) {
          console.warn("Prevented map call on undefined/null")
          return []
        }
        return originalMap.call(this, callback, thisArg)
      } catch (error) {
        console.error("Error in patched map:", error)
        return []
      }
    }

    // Store the original filter method
    const originalFilter = Array.prototype.filter

    // Replace with a safe version that checks for undefined/null
    Array.prototype.filter = function safeFilter(callback, thisArg) {
      try {
        if (this === undefined || this === null) {
          console.warn("Prevented filter call on undefined/null")
          return []
        }
        return originalFilter.call(this, callback, thisArg)
      } catch (error) {
        console.error("Error in patched filter:", error)
        return []
      }
    }

    console.log("Successfully patched Array prototype methods")
  } catch (error) {
    console.error("Failed to patch Array prototype methods:", error)
  }
}

// Global error handler for uncaught errors
export function setupGlobalErrorHandler() {
  if (typeof window !== "undefined") {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error("Global error caught:", { message, source, lineno, colno, error })
      return false // Let the default handler run as well
    }

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)
    })

    console.log("Global error handlers installed")
  }
}
