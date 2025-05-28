"use client"

import { useState, useEffect } from "react"
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
import { Users, Phone, Building, Star, User, BookOpen, Search, Plus, FileAudio, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { ProfileDropdown } from "./profile-dropdown"
import { SmartCallDock } from "./smart-call-dock"
import { UsersView } from "./users-view"
import { CallQueuesView } from "./call-queues-view"
import { MySiteView } from "./my-site-view"
import { MyProfileView } from "./my-profile-view"
import { PhonebookView } from "./phonebook-view"
import { CallRecordingsView } from "./call-recordings-view"
import { ThemeToggle } from "./theme-toggle"
import { SafeErrorBoundary, useErrorHandlers } from "./safe-error-boundary"

import { RealTimeNotifications } from "./real-time-notifications"
import { ConnectionStatus } from "./connection-status"
import { Toaster } from "sonner"

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
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded dark:bg-yellow-900 dark:text-yellow-200">
                            WIP
                          </span>
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
  try {
    switch (activeTab) {
      case "users":
        return (
          <SafeErrorBoundary>
            <UsersView />
          </SafeErrorBoundary>
        )
      case "queues":
        return (
          <SafeErrorBoundary>
            <CallQueuesView />
          </SafeErrorBoundary>
        )
      case "recordings":
        return (
          <SafeErrorBoundary>
            <CallRecordingsView />
          </SafeErrorBoundary>
        )
      case "my-site":
        return (
          <SafeErrorBoundary>
            <MySiteView />
          </SafeErrorBoundary>
        )
      case "my-profile":
        return (
          <SafeErrorBoundary>
            <MyProfileView />
          </SafeErrorBoundary>
        )
      case "phonebook":
        return (
          <SafeErrorBoundary>
            <PhonebookView />
          </SafeErrorBoundary>
        )
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
        return (
          <SafeErrorBoundary>
            <UsersView />
          </SafeErrorBoundary>
        )
    }
  } catch (error) {
    console.error("Error rendering view:", error)
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800">Error loading view. Please try refreshing the page.</p>
        </CardContent>
      </Card>
    )
  }
}

export function ZoomPhoneDashboard() {
  const [activeTab, setActiveTab] = useState("users")
  const [phoneAccess, setPhoneAccess] = useState<{ hasAccess: boolean; error: string | null } | null>(null)

  // Initialize error handlers
  useErrorHandlers()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch("/api/zoom/check-phone-access")
        const data = await response.json()
        setPhoneAccess(data)
      } catch (error) {
        console.error("Error checking phone access:", error)
        setPhoneAccess({ hasAccess: false, error: "Failed to check phone access" })
      }
    }
    checkAccess()
  }, [])

  // Show phone access warning if needed
  if (phoneAccess && !phoneAccess.hasAccess) {
    return (
      <SafeErrorBoundary>
        <SidebarProvider>
          <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <h1 className="text-lg font-semibold">Zoom Phone Dashboard</h1>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="h-5 w-5" />
                    Zoom Phone Not Available
                  </CardTitle>
                  <CardDescription>Your account doesn't have access to Zoom Phone features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      <strong>Error:</strong> {phoneAccess.error}
                    </p>
                    <p className="mt-2">This usually means:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Your Zoom account doesn't have a Zoom Phone license</li>
                      <li>Zoom Phone isn't enabled for your organization</li>
                      <li>Your app doesn't have the required phone scopes</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => (window.location.href = "/debug/endpoints")}>
                      Debug API Access
                    </Button>
                    <Button variant="outline" onClick={() => window.open("https://zoom.us/pricing/phone", "_blank")}>
                      Learn About Zoom Phone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </SafeErrorBoundary>
    )
  }

  return (
    <SafeErrorBoundary>
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
              <ThemeToggle />
              <ProfileDropdown />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{renderActiveView(activeTab)}</div>
        </SidebarInset>
        <SmartCallDock />

        {/* Add real-time notifications */}
        <RealTimeNotifications />
        <Toaster position="top-right" />
      </SidebarProvider>
    </SafeErrorBoundary>
  )
}
