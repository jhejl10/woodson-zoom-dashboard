"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Circle, CircleDot, Clock, Minus, Settings, User, Edit } from "lucide-react"

const presenceOptions = [
  { value: "available", label: "Available", icon: Circle, color: "text-green-500 fill-green-500" },
  { value: "busy", label: "Busy", icon: CircleDot, color: "text-red-500 fill-red-500" },
  { value: "away", label: "Away", icon: Clock, color: "text-yellow-500 fill-yellow-500" },
  { value: "dnd", label: "Do Not Disturb", icon: Minus, color: "text-red-600 fill-red-600" },
]

export function ProfileDropdown() {
  const [presence, setPresence] = useState("available")
  const [statusMessage, setStatusMessage] = useState("Available for calls")
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  const currentPresence = presenceOptions.find((p) => p.value === presence)
  const PresenceIcon = currentPresence?.icon || Circle

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
              presence === "available"
                ? "bg-green-500"
                : presence === "busy"
                  ? "bg-red-500"
                  : presence === "away"
                    ? "bg-yellow-500"
                    : presence === "dnd"
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
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">john.doe@company.com</p>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PresenceIcon className={`h-3 w-3 ${currentPresence?.color}`} />
                  <span className="text-sm">{currentPresence?.label}</span>
                </div>
                <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Update Status</DialogTitle>
                      <DialogDescription>Change your presence status and message</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="presence">Presence Status</Label>
                        <Select value={presence} onValueChange={setPresence}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {presenceOptions.map((option) => {
                              const Icon = option.icon
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center space-x-2">
                                    <Icon className={`h-3 w-3 ${option.color}`} />
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status-message">Status Message</Label>
                        <Textarea
                          id="status-message"
                          placeholder="What's your status?"
                          value={statusMessage}
                          onChange={(e) => setStatusMessage(e.target.value)}
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                      <Button onClick={() => setIsStatusDialogOpen(false)} className="w-full">
                        Update Status
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {statusMessage && <p className="text-xs text-muted-foreground">{statusMessage}</p>}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Zoom Phone Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Zoom Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
