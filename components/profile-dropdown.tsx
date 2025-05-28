"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Circle, CircleDot, Clock, Minus, Settings, User, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

const presenceOptions = [
  { value: "available", label: "Available", icon: Circle, color: "text-green-500 fill-green-500" },
  { value: "busy", label: "Busy", icon: CircleDot, color: "text-red-500 fill-red-500" },
  { value: "away", label: "Away", icon: Clock, color: "text-yellow-500 fill-yellow-500" },
  { value: "dnd", label: "Do Not Disturb", icon: Minus, color: "text-red-600 fill-red-600" },
]

export function ProfileDropdown() {
  const { user, loading, updatePresence } = useCurrentUser()
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Initialize status message from user data
  useEffect(() => {
    if (user?.presence?.status_message) {
      setStatusMessage(user.presence.status_message)
    }
  }, [user])

  const handleStatusChange = async (status: string) => {
    if (!user || status === user.presence.status) return

    try {
      setIsUpdating(true)
      await updatePresence(status, statusMessage)
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusMessageSave = async () => {
    if (!user) return

    try {
      setIsUpdating(true)
      await updatePresence(user.presence.status, statusMessage)
      setIsEditingMessage(false)
    } catch (error) {
      console.error("Failed to update status message:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  const currentPresence = presenceOptions.find((p) => p.value === user.presence.status) || presenceOptions[0]
  const PresenceIcon = currentPresence.icon

  // Generate initials from name
  const initials = user.display_name
    ? user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} alt={user.display_name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
              user.presence.status === "available"
                ? "bg-green-500"
                : user.presence.status === "busy"
                  ? "bg-red-500"
                  : user.presence.status === "away"
                    ? "bg-yellow-500"
                    : user.presence.status === "dnd"
                      ? "bg-red-600"
                      : "bg-gray-400"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} alt={user.display_name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{user.display_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                {user.phone?.extension_number && (
                  <p className="text-xs leading-none text-muted-foreground">Ext. {user.phone.extension_number}</p>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-muted-foreground">Status</div>
              <DropdownMenuRadioGroup value={user.presence.status} onValueChange={handleStatusChange}>
                {presenceOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                      disabled={isUpdating}
                    >
                      <Icon className={`h-3 w-3 ${option.color}`} />
                      <span>{option.label}</span>
                      {isUpdating && user.presence.status === option.value && (
                        <Loader2 className="ml-auto h-3 w-3 animate-spin" />
                      )}
                    </DropdownMenuRadioItem>
                  )
                })}
              </DropdownMenuRadioGroup>
            </div>

            {/* Status Message */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-muted-foreground">Status Message</div>
              {isEditingMessage ? (
                <div className="flex gap-2">
                  <Input
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="What's your status?"
                    className="h-8 text-sm"
                    disabled={isUpdating}
                  />
                  <Button size="sm" className="h-8 px-2" onClick={handleStatusMessageSave} disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                  </Button>
                </div>
              ) : (
                <div
                  className="text-sm p-2 border rounded-md cursor-pointer hover:bg-muted"
                  onClick={() => setIsEditingMessage(true)}
                >
                  {statusMessage || "Set a status message..."}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setDropdownOpen(false)}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDropdownOpen(false)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Zoom Phone Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDropdownOpen(false)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Zoom Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
