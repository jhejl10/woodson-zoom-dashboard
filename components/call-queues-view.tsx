"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building, Phone, Clock, Users, AlertCircle, TrendingUp } from "lucide-react"
import { useZoomQueues } from "@/hooks/use-zoom-data"

function getStatusColor(status: string) {
  switch (status) {
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

function QueueCard({ queue }: { queue: any }) {
  const hasWaitingCalls = queue.waitingCalls > 0
  const isUrgent = queue.waitingCalls > 2 || (queue.longestWait && Number.parseInt(queue.longestWait.split(":")[0]) > 3)

  return (
    <Card className={`${isUrgent ? "border-red-500 bg-red-50/50" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {queue.name}
            {isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
          </CardTitle>
          <Badge variant={hasWaitingCalls ? "destructive" : "secondary"}>{queue.waitingCalls} waiting</Badge>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Building className="h-3 w-3" />
          {queue.site}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Queue Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{queue.waitingCalls}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{queue.longestWait}</p>
            <p className="text-xs text-muted-foreground">Longest Wait</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{queue.averageWait}</p>
            <p className="text-xs text-muted-foreground">Avg Wait</p>
          </div>
        </div>

        {/* Agent Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Agents</p>
            <p className="text-sm text-muted-foreground">
              {queue.availableAgents}/{queue.totalAgents} available
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {queue.agents.map((agent: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                    <AvatarFallback className="text-xs">
                      {agent.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-background ${getStatusColor(agent.status)}`}
                  />
                </div>
                <span className="text-xs">{agent.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Users className="h-3 w-3 mr-1" />
            Manage Agents
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            View Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SiteQueueGroup({ siteName, queues }: { siteName: string; queues: any }) {
  const totalWaiting = queues.reduce((sum: number, queue: any) => sum + queue.waitingCalls, 0)
  const totalAgents = queues.reduce((sum: number, queue: any) => sum + queue.totalAgents, 0)
  const availableAgents = queues.reduce((sum: number, queue: any) => sum + queue.availableAgents, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building className="h-4 w-4" />
          {siteName}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalWaiting} calls waiting</span>
          <span>
            {availableAgents}/{totalAgents} agents available
          </span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {queues.map((queue: any) => (
          <QueueCard key={queue.id} queue={queue} />
        ))}
      </div>
    </div>
  )
}

export function CallQueuesView() {
  // Use real data from the API
  const { queues: callQueuesData, loading, error, refetch } = useZoomQueues()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-muted-foreground">Loading call queues...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-red-600">Error loading queues: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Group queues by site
  const groupedQueues = callQueuesData?.reduce(
    (acc: any, queue: any) => {
      if (!acc[queue.site]) {
        acc[queue.site] = []
      }
      acc[queue.site].push(queue)
      return acc
    },
    {} as Record<string, any>,
  )

  const totalWaiting = callQueuesData?.reduce((sum: number, queue: any) => sum + queue.waitingCalls, 0)
  const totalQueues = callQueuesData?.length || 0
  const urgentQueues = callQueuesData?.filter((q: any) => q.waitingCalls > 2).length || 0

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queues</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Waiting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWaiting}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Queues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentQueues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(groupedQueues || {}).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Queues by Site */}
      <div className="space-y-8">
        {Object.entries(groupedQueues || {}).map(([site, queues]) => (
          <SiteQueueGroup key={site} siteName={site} queues={queues} />
        ))}
      </div>
    </div>
  )
}
