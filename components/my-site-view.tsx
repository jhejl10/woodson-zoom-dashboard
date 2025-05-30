"use client"

import { UsersView } from "./users-view"
import { CallQueuesView } from "./call-queues-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, Phone } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export function MySiteView() {
  // Get the current user's actual site
  const { user: currentUser, loading } = useCurrentUser()
  const currentUserSite = currentUser?.phone?.site_name || currentUser?.site_name || "Main Office"

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Loading your site...
            </CardTitle>
            <CardDescription>Please wait while we load your site information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Site Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {currentUserSite}
          </CardTitle>
          <CardDescription>View all users and call queues at your site</CardDescription>
        </CardHeader>
      </Card>

      {/* Site Content */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Site Users
          </TabsTrigger>
          <TabsTrigger value="queues" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Site Queues
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          {/* This will automatically filter to show users from the current site */}
          <UsersView />
        </TabsContent>
        <TabsContent value="queues" className="space-y-4">
          {/* This will automatically filter to show queues from the current site */}
          <CallQueuesView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
