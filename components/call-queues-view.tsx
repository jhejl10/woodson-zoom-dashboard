"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Users, Clock, Plus } from "lucide-react"
import { useZoomQueues } from "@/hooks/use-zoom-data"

export function CallQueuesView() {
  const [searchTerm, setSearchTerm] = useState("")

  // Use real Zoom data with enhanced error handling
  const { queues, loading, error, refetch } = useZoomQueues()

  // Triple-check that queues is always an array
  let safeQueues: any[] = []
  try {
    if (Array.isArray(queues)) {
      safeQueues = queues.filter((queue) => queue != null)
    } else if (queues && typeof queues === "object" && Array.isArray(queues.queues)) {
      safeQueues = queues.queues.filter((queue) => queue != null)
    }
  } catch (err) {
    console.error("Error processing queues:", err)
    safeQueues = []
  }

  let filteredQueues: any[] = []
  try {
    filteredQueues = safeQueues.filter((queue: any) => {
      if (!queue) return false

      const name = queue.name || ""
      const extension = queue.extension || ""
      const searchLower = searchTerm.toLowerCase()

      return name.toLowerCase().includes(searchLower) || extension.includes(searchTerm)
    })
  } catch (err) {
    console.error("Error filtering queues:", err)
    filteredQueues = []
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Call Queues</h2>
          <Button onClick={refetch}>Retry</Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">Error loading call queues: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Call Queues</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Queue
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search queues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Call Queues ({loading ? "..." : filteredQueues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQueues.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queue Name</TableHead>
                  <TableHead>Extension</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waiting Calls</TableHead>
                  <TableHead>Available Agents</TableHead>
                  <TableHead>Longest Wait</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueues.map((queue: any, index: number) => {
                  if (!queue) return null

                  return (
                    <TableRow key={queue.id || index} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="flex items-center space-x-3">
                        <div className="p-2 rounded bg-blue-100 text-blue-600">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{queue.name || "Unknown Queue"}</div>
                          <div className="text-sm text-muted-foreground">{queue.description || ""}</div>
                        </div>
                      </TableCell>
                      <TableCell>{queue.extension || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={queue.status === "active" ? "default" : "secondary"}>
                          {queue.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{queue.waiting_calls || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{queue.available_agents || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{queue.longest_wait_time || "0:00"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {safeQueues.length === 0 ? "No call queues found" : "No queues match your search criteria"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
