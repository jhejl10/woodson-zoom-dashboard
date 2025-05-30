"use server"

import { getPhoneUsers, getSites, getCommonAreaPhones, getPhoneDevices, getUserPresence } from "./zoom-api"

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class ZoomDataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private rateLimits = new Map<string, RateLimitEntry>()
  private requestQueue: Array<() => Promise<void>> = []
  private isProcessingQueue = false

  // Cache durations in milliseconds
  private readonly CACHE_DURATIONS = {
    users: 15 * 60 * 1000, // 15 minutes
    common_areas: 15 * 60 * 1000, // 15 minutes
    sites: 15 * 60 * 1000, // 15 minutes
    devices: 15 * 60 * 1000, // 15 minutes
    presence: 2 * 60 * 1000, // 2 minutes (more frequent for presence)
  }

  // Rate limiting: max 10 requests per second
  private readonly RATE_LIMIT = {
    maxRequests: 10,
    windowMs: 1000,
  }

  private isRateLimited(key: string): boolean {
    const now = Date.now()
    const limit = this.rateLimits.get(key)

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + this.RATE_LIMIT.windowMs,
      })
      return false
    }

    if (limit.count >= this.RATE_LIMIT.maxRequests) {
      return true
    }

    limit.count++
    return false
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (request) {
        try {
          await request()
        } catch (error) {
          console.error("Error processing queued request:", error)
        }
        // Wait 100ms between requests to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    this.isProcessingQueue = false
  }

  private async queueRequest<T>(key: string, apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          if (this.isRateLimited("global")) {
            console.log("Rate limited, waiting...")
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }

          const result = await apiCall()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiresAt
  }

  private setCache<T>(key: string, data: T, duration: number): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    })
    console.log(`Cached ${key} for ${duration / 1000}s`)
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (entry && this.isCacheValid(entry)) {
      console.log(`Cache hit for ${key}`)
      return entry.data
    }
    if (entry) {
      console.log(`Cache expired for ${key}`)
      this.cache.delete(key)
    }
    return null
  }

  async getUsers(): Promise<any[]> {
    const cached = this.getCache<any[]>("users")
    if (cached) return cached

    console.log("Fetching users from API...")
    const users = await this.queueRequest("users", getPhoneUsers)
    this.setCache("users", users, this.CACHE_DURATIONS.users)
    return users
  }

  async getCommonAreas(): Promise<any[]> {
    const cached = this.getCache<any[]>("common_areas")
    if (cached) {
      console.log("Returning cached common areas:", cached.length)
      return cached
    }

    console.log("Fetching common areas from API...")
    try {
      const commonAreas = await this.queueRequest("common_areas", getCommonAreaPhones)
      console.log("Raw common areas from API:", commonAreas)
      this.setCache("common_areas", commonAreas, this.CACHE_DURATIONS.common_areas)
      return commonAreas
    } catch (error) {
      console.error("Error fetching common areas:", error)
      return []
    }
  }

  async getSitesData(): Promise<any[]> {
    const cached = this.getCache<any[]>("sites")
    if (cached) return cached

    console.log("Fetching sites from API...")
    const sites = await this.queueRequest("sites", getSites)
    this.setCache("sites", sites, this.CACHE_DURATIONS.sites)
    return sites
  }

  async getDevices(): Promise<any[]> {
    const cached = this.getCache<any[]>("devices")
    if (cached) return cached

    console.log("Fetching devices from API...")
    const devices = await this.queueRequest("devices", getPhoneDevices)
    this.setCache("devices", devices, this.CACHE_DURATIONS.devices)
    return devices
  }

  async getUserPresenceData(userId: string): Promise<any | null> {
    const cacheKey = `presence_${userId}`
    const cached = this.getCache<any>(cacheKey)
    if (cached) return cached

    console.log(`Fetching presence for user ${userId} from API...`)
    try {
      const presence = await this.queueRequest(`presence_${userId}`, () => getUserPresence(userId))
      this.setCache(cacheKey, presence, this.CACHE_DURATIONS.presence)
      return presence
    } catch (error) {
      console.error(`Error fetching presence for user ${userId}:`, error)
      return null
    }
  }

  // Update cache from WebSocket events
  updateUserPresence(userId: string, presenceData: any): void {
    const cacheKey = `presence_${userId}`
    this.setCache(cacheKey, presenceData, this.CACHE_DURATIONS.presence)
    console.log(`Updated presence cache for user ${userId} from WebSocket`)
  }

  updateUser(userId: string, userData: any): void {
    const users = this.getCache<any[]>("users")
    if (users) {
      const userIndex = users.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData }
        this.setCache("users", users, this.CACHE_DURATIONS.users)
        console.log(`Updated user cache for user ${userId} from WebSocket`)
      }
    }
  }

  // Force refresh cache (for manual refresh)
  async forceRefresh(type: "users" | "common_areas" | "sites" | "devices" | "all"): Promise<void> {
    if (type === "all") {
      this.cache.clear()
      console.log("Cleared all cache")
      return
    }

    this.cache.delete(type)
    console.log(`Cleared cache for ${type}`)

    // Pre-populate cache
    switch (type) {
      case "users":
        await this.getUsers()
        break
      case "common_areas":
        await this.getCommonAreas()
        break
      case "sites":
        await this.getSitesData()
        break
      case "devices":
        await this.getDevices()
        break
    }
  }

  // Get cache stats for debugging
  async getCacheStats(): Promise<any> {
    const stats: any = {}
    for (const [key, entry] of this.cache.entries()) {
      stats[key] = {
        size: Array.isArray(entry.data) ? entry.data.length : 1,
        age: Date.now() - entry.timestamp,
        expiresIn: entry.expiresAt - Date.now(),
        expired: !this.isCacheValid(entry),
      }
    }
    return stats
  }
}

// Singleton instance
let cacheInstance: ZoomDataCache | null = null

export async function getZoomCache(): Promise<ZoomDataCache> {
  if (!cacheInstance) {
    cacheInstance = new ZoomDataCache()
  }
  return cacheInstance
}

// Background refresh job
export async function refreshCacheInBackground(): Promise<void> {
  const cache = await getZoomCache()
  console.log("Starting background cache refresh...")

  try {
    // Refresh all static data
    await Promise.allSettled([cache.getUsers(), cache.getCommonAreas(), cache.getSitesData(), cache.getDevices()])
    console.log("Background cache refresh completed")
  } catch (error) {
    console.error("Error in background cache refresh:", error)
  }
}
