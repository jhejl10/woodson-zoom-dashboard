// Check if we're in development/preview mode
export function isDevMode(): boolean {
  // Check if we're in the v0 preview environment or local development
  return (
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname.includes("v0.dev")) ||
    !process.env.ZOOM_CLIENT_ID
  )
}
