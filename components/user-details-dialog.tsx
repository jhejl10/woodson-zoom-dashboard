"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Phone, MessageSquare, MessageCircle, Mail, MapPin, Clock, User, Building, PhoneCall } from "lucide-react"

interface UserDetailsDialogProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  if (!user) return null

  const getStatusColor = () => {
    switch (user.presence) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-red-500"
      case "away":
        return "bg-yellow-500"
      case "dnd":
        return "bg-red-600"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (user.presence) {
      case "available":
        return "Available"
      case "busy":
        return "Busy"
      case "away":
        return "Away"
      case "dnd":
        return "Do Not Disturb"
      case "offline":
        return "Offline"
      default:
        return "Unknown"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor()}`}
              />
            </div>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.title}</p>
            </div>
          </DialogTitle>
          <DialogDescription>{user.type === "common_area" ? "Common Area Phone" : "User Details"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
                {getStatusText()}
              </Badge>
            </div>

            {user.statusMessage && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Message</span>
                <span className="text-sm text-muted-foreground">{user.statusMessage}</span>
              </div>
            )}

            {user.onCall && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">On Call With</span>
                <span className="text-sm text-muted-foreground">{user.currentCall}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Extension {user.extension}</span>
            </div>

            {user.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.site}</span>
            </div>

            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.location}</span>
              </div>
            )}

            {user.lastSeen && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Last seen {user.lastSeen}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button className="flex flex-col items-center gap-1 h-auto py-3">
              <Phone className="h-4 w-4" />
              <span className="text-xs">Call</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">Text</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Chat</span>
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <PhoneCall className="h-4 w-4 mr-2" />
              Transfer Call
            </Button>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
