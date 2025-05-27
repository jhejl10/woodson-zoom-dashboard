"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Users,
  Phone,
  Building,
  Star,
  User,
  BookOpen,
  Search,
  Plus,
  PhoneIncoming,
  PhoneOutgoing,
  Voicemail,
  MessageSquare,
  Volume2,
  Download,
  FileAudio,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ProfileDropdown } from "./profile-dropdown"
import { SmartCallDock } from "./smart-call-dock"
import { UsersView } from "./users-view"
import { CallQueuesView } from "./call-queues-view"
import { MySiteView } from "./my-site-view"
import { MyProfileView } from "./my-profile-view"
import { PhonebookView } from "./phonebook-view"
import { CallRecordingsView } from "./call-recordings-view"

import { RealTimeNotifications } from "./real-time-notifications"
import { ConnectionStatus } from "./connection-status"
import { LiveCallFeed } from "./live-call-feed"
import { QueueAlerts } from "./queue-alerts"
import { Toaster } from "sonner"

// Sample data
const recentCalls = [
  {
    id: 1,
    name: "Sarah Johnson",
    number: "+1 (555) 123-4567",
    type: "incoming",
    duration: "5:23",
    time: "2 minutes ago",
    status: "answered",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "Mike Chen",
    number: "+1 (555) 987-6543",
    type: "outgoing",
    duration: "12:45",
    time: "15 minutes ago",
    status: "answered",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "Unknown",
    number: "+1 (555) 456-7890",
    type: "incoming",
    duration: "0:00",
    time: "1 hour ago",
    status: "missed",
    avatar: null,
  },
  {
    id: 4,
    name: "Emily Davis",
    number: "+1 (555) 234-5678",
    type: "outgoing",
    duration: "8:12",
    time: "2 hours ago",
    status: "answered",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const contacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Sales Manager",
    number: "+1 (555) 123-4567",
    email: "sarah.johnson@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "available",
  },
  {
    id: 2,
    name: "Mike Chen",
    title: "Product Manager",
    number: "+1 (555) 987-6543",
    email: "mike.chen@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "busy",
  },
  {
    id: 3,
    name: "Emily Davis",
    title: "Marketing Director",
    number: "+1 (555) 234-5678",
    email: "emily.davis@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "away",
  },
]

const voicemails = [
  {
    id: 1,
    from: "Sarah Johnson",
    number: "+1 (555) 123-4567",
    duration: "1:23",
    time: "30 minutes ago",
    isNew: true,
    transcript: "Hi, this is Sarah. I wanted to follow up on our meeting yesterday...",
  },
  {
    id: 2,
    from: "Unknown Caller",
    number: "+1 (555) 999-8888",
    duration: "0:45",
    time: "2 hours ago",
    isNew: true,
    transcript: "Hello, I'm calling regarding the proposal you sent...",
  },
]

const navigationItems = [
  {
    title: "Users",
    icon: Users,
    id: "users",
    description: "All users and common areas",
  },
  {
    title: "Call Queues",
    icon: Phone,
    id: "queues",
    description: "All visible call queues grouped by site",
  },
  {
    title: "Call Recordings",
    icon: FileAudio,
    id: "recordings",
    description: "View and manage call recordings",
  },
  {
    title: "My Site",
    icon: Building,
    id: "my-site",
    description: "Users and common areas at your site",
  },
  {
    title: "My View",
    icon: Star,
    id: "my-view",
    description: "Custom list of users and speed dials",
    isWip: true,
  },
  {
    title: "My Profile",
    icon: User,
    id: "my-profile",
    description: "Recent calls, voicemails, texts, and analytics",
  },
  {
    title: "Phonebook",
    icon: BookOpen,
    id: "phonebook",
    description: "Custom phonebook for better call identification",
  },
]

function AppSidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Phone className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Zoom Phone</span>
                <span className="truncate text-xs text-muted-foreground">Companion App</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild isActive={activeTab === item.id} onClick={() => onTabChange(item.id)}>
                    <button className="flex items-center gap-2 w-full">
                      <item.icon className="size-4" />
                      <div className="flex-1 text-left">
                        <span className="text-sm">{item.title}</span>
                        {item.isWip && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">WIP</span>
                        )}
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function getPageTitle(activeTab: string) {
  const item = navigationItems.find((item) => item.id === activeTab)
  return item?.title || "Dashboard"
}

function renderActiveView(activeTab: string) {
  switch (activeTab) {
    case "users":
      return <UsersView />
    case "queues":
      return <CallQueuesView />
    case "recordings":
      return <CallRecordingsView />
    case "my-site":
      return <MySiteView />
    case "my-profile":
      return <MyProfileView />
    case "phonebook":
      return <PhonebookView />
    case "my-view":
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Star className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">My View - Coming Soon</h3>
            <p className="text-muted-foreground">
              This feature will allow you to create custom lists of users and speed dials
            </p>
          </div>
        </div>
      )
    default:
      return <UsersView />
  }
}

function CallStatusCard({
  title,
  value,
  icon: Icon,
  trend,
}: { title: string; value: string; icon: any; trend?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
      </CardContent>
    </Card>
  )
}

function RecentCallItem({ call }: { call: (typeof recentCalls)[0] }) {
  const getCallIcon = () => {
    if (call.type === "incoming") {
      return call.status === "missed" ? PhoneIncoming : PhoneIncoming
    }
    return PhoneOutgoing
  }

  const getCallColor = () => {
    if (call.status === "missed") return "text-red-500"
    if (call.type === "incoming") return "text-green-500"
    return "text-blue-500"
  }

  const CallIcon = getCallIcon()

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg">
      <div className={`p-2 rounded-full bg-muted ${getCallColor()}`}>
        <CallIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">{call.name}</p>
          <p className="text-xs text-muted-foreground">{call.time}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{call.number}</p>
          <p className="text-xs text-muted-foreground">{call.duration}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  )
}

function ContactItem({ contact }: { contact: (typeof contacts)[0] }) {
  const getStatusColor = () => {
    switch (contact.status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-red-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
          <AvatarFallback>
            {contact.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div
          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor()}`}
        />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{contact.name}</p>
        <p className="text-xs text-muted-foreground">{contact.title}</p>
        <p className="text-xs text-muted-foreground">{contact.number}</p>
      </div>
      <div className="flex space-x-1">
        <Button variant="ghost" size="sm">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function VoicemailItem({ voicemail }: { voicemail: (typeof voicemails)[0] }) {
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg">
      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
        <Voicemail className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{voicemail.from}</p>
            {voicemail.isNew && (
              <Badge variant="destructive" className="text-xs">
                New
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{voicemail.time}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {voicemail.number} • {voicemail.duration}
        </p>
        <p className="text-sm text-muted-foreground">{voicemail.transcript}</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Volume2 className="h-4 w-4 mr-1" />
            Play
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ZoomPhoneDashboard() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">{getPageTitle(activeTab)}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <ConnectionStatus />
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-64" />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Call
            </Button>
            <ProfileDropdown />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Add QueueAlerts at the top of the content */}
          <QueueAlerts />

          {/* Add LiveCallFeed to the sidebar or as a floating component */}
          <div className="fixed top-20 right-4 w-80 z-40">
            <LiveCallFeed />
          </div>

          {renderActiveView(activeTab)}
        </div>
      </SidebarInset>
      <SmartCallDock />

      {/* Add real-time notifications */}
      <RealTimeNotifications />
      <Toaster position="top-right" />
    </SidebarProvider>
  )
}
