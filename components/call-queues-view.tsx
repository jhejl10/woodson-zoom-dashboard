"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building, Phone, Clock, Users, AlertCircle, TrendingUp } from "lucide-react"

const callQueuesData = [
  {
    id: 1,
    name: "Sales Queue",
    site: "New York Office",
    waitingCalls: 3,
    longestWait: "2:45",
    averageWait: "1:23",
    agents: [
      { name: "Sarah Johnson", status: "available", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Mike Chen", status: "busy", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Emily Davis", status: "away", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    totalAgents: 5,
    availableAgents: 2,
  },
  {
    id: 2,
    name: "Support Queue",
    site: "New York Office",
    waitingCalls: 1,
    longestWait: "0:45",
    averageWait: "0:32",
    agents: [
      { name: "Alex Rodriguez", status: "available", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Lisa Wang", status: "busy", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    totalAgents: 3,
    availableAgents: 1,
  },
  {
    id: 3,
    name: "Engineering Queue",
    site: "San Francisco Office",
    waitingCalls: 0,
    longestWait: "0:00",
    averageWait: "0:00",
    agents: [
      { name: "David Kim", status: "available", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jennifer Liu", status: "available", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    totalAgents: 4,
    availableAgents: 2,
  },
]

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

function QueueCard({ queue }: { queue: (typeof callQueuesData)[0] }) {
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
            {queue.agents.map((agent, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                    <AvatarFallback className="text-xs">
                      {agent.name
                        .split(" ")
                        .map((n) => n[0])
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

function SiteQueueGroup({ siteName, queues }: { siteName: string; queues: typeof callQueuesData }) {
  const totalWaiting = queues.reduce((sum, queue) => sum + queue.waitingCalls, 0)
  const totalAgents = queues.reduce((sum, queue) => sum + queue.totalAgents, 0)
  const availableAgents = queues.reduce((sum, queue) => sum + queue.availableAgents, 0)

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
        {queues.map((queue) => (
          <QueueCard key={queue.id} queue={queue} />
        ))}
      </div>
    </div>
  )
}

export function CallQueuesView() {
  // Group queues by site
  const groupedQueues = callQueuesData.reduce(
    (acc, queue) => {
      if (!acc[queue.site]) {
        acc[queue.site] = []
      }
      acc[queue.site].push(queue)
      return acc
    },
    {} as Record<string, typeof callQueuesData>,
  )

  const totalWaiting = callQueuesData.reduce((sum, queue) => sum + queue.waitingCalls, 0)
  const totalQueues = callQueuesData.length
  const urgentQueues = callQueuesData.filter((q) => q.waitingCalls > 2).length

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
            <div className="text-2xl font-bold">{Object.keys(groupedQueues).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Queues by Site */}
      <div className="space-y-8">
        {Object.entries(groupedQueues).map(([site, queues]) => (
          <SiteQueueGroup key={site} siteName={site} queues={queues} />
        ))}
      </div>
    </div>
  )
}
