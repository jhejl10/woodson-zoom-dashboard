"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Pause,
  Download,
  Share,
  Trash2,
  FileAudio,
  Clock,
  Calendar,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  MoreHorizontal,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  FileText,
  Settings,
  Copy,
} from "lucide-react"
import { format } from "date-fns"
import { useCallRecordings } from "@/hooks/use-call-recordings"

// Sample call recordings data
// const sampleRecordings = [
//   {
//     id: "rec_001",
//     call_id: "call_001",
//     recording_type: "automatic",
//     file_type: "mp3",
//     file_size: 2048576, // 2MB
//     duration: 185, // 3:05
//     download_url: "/api/recordings/rec_001/download",
//     play_url: "/api/recordings/rec_001/play",
//     start_time: "2024-01-15T10:30:00Z",
//     end_time: "2024-01-15T10:33:05Z",
//     participants: [
//       {
//         user_id: "user_001",
//         user_name: "John Doe",
//         user_email: "john.doe@company.com",
//         join_time: "2024-01-15T10:30:00Z",
//         leave_time: "2024-01-15T10:33:05Z",
//       },
//       {
//         user_id: "external",
//         user_name: "Sarah Johnson",
//         user_email: "sarah@client.com",
//         join_time: "2024-01-15T10:30:15Z",
//         leave_time: "2024-01-15T10:33:05Z",
//       },
//     ],
//     caller_number: "+1 (555) 123-4567",
//     callee_number: "+1 (555) 987-6543",
//     direction: "outbound",
//     status: "completed",
//     transcript: {
//       id: "trans_001",
//       status: "completed",
//       content:
//         "John: Hi Sarah, thanks for taking my call today. I wanted to discuss the project timeline.\n\nSarah: Of course! I've been looking forward to this conversation. What specific aspects would you like to cover?\n\nJohn: Well, primarily the deliverables for Q1 and how we can ensure we meet the March deadline...",
//       confidence: 0.92,
//       language: "en-US",
//     },
//     created_at: "2024-01-15T10:33:10Z",
//     updated_at: "2024-01-15T10:35:00Z",
//   },
//   {
//     id: "rec_002",
//     call_id: "call_002",
//     recording_type: "on_demand",
//     file_type: "mp3",
//     file_size: 1536000, // 1.5MB
//     duration: 142, // 2:22
//     download_url: "/api/recordings/rec_002/download",
//     play_url: "/api/recordings/rec_002/play",
//     start_time: "2024-01-15T14:15:00Z",
//     end_time: "2024-01-15T14:17:22Z",
//     participants: [
//       {
//         user_id: "user_001",
//         user_name: "John Doe",
//         user_email: "john.doe@company.com",
//         join_time: "2024-01-15T14:15:00Z",
//         leave_time: "2024-01-15T14:17:22Z",
//       },
//     ],
//     caller_number: "+1 (555) 456-7890",
//     callee_number: "+1 (555) 123-4567",
//     direction: "inbound",
//     status: "completed",
//     transcript: {
//       id: "trans_002",
//       status: "processing",
//       content: "",
//       confidence: 0,
//       language: "en-US",
//     },
//     created_at: "2024-01-15T14:17:30Z",
//     updated_at: "2024-01-15T14:17:30Z",
//   },
//   {
//     id: "rec_003",
//     call_id: "call_003",
//     recording_type: "automatic",
//     file_type: "mp3",
//     file_size: 3072000, // 3MB
//     duration: 298, // 4:58
//     download_url: "/api/recordings/rec_003/download",
//     play_url: "/api/recordings/rec_003/play",
//     start_time: "2024-01-14T16:45:00Z",
//     end_time: "2024-01-14T16:49:58Z",
//     participants: [
//       {
//         user_id: "user_001",
//         user_name: "John Doe",
//         user_email: "john.doe@company.com",
//         join_time: "2024-01-14T16:45:00Z",
//         leave_time: "2024-01-14T16:49:58Z",
//       },
//       {
//         user_id: "user_002",
//         user_name: "Mike Chen",
//         user_email: "mike.chen@company.com",
//         join_time: "2024-01-14T16:45:30Z",
//         leave_time: "2024-01-14T16:49:58Z",
//       },
//     ],
//     caller_number: "+1 (555) 234-5678",
//     callee_number: "+1 (555) 345-6789",
//     direction: "inbound",
//     status: "completed",
//     created_at: "2024-01-14T16:50:05Z",
//     updated_at: "2024-01-14T16:50:05Z",
//   },
// ]

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

interface AudioPlayerProps {
  recording: any
  isPlaying: boolean
  onPlayPause: () => void
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  volume: number
  onVolumeChange: (volume: number) => void
}

function AudioPlayer({
  recording,
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
}: AudioPlayerProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="Recording" />
              <AvatarFallback>
                <FileAudio className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {recording.direction === "inbound" ? recording.caller_number : recording.callee_number}
              </CardTitle>
              <CardDescription>{format(new Date(recording.start_time), "MMM d, yyyy 'at' h:mm a")}</CardDescription>
            </div>
          </div>
          <Badge variant={recording.recording_type === "automatic" ? "default" : "secondary"}>
            {recording.recording_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={(value) => onSeek(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button onClick={onPlayPause} size="sm">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                onMouseEnter={() => setShowVolumeSlider(true)}
              >
                {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              {showVolumeSlider && (
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-background border rounded-lg shadow-lg"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => onVolumeChange(value[0])}
                    orientation="vertical"
                    className="h-20"
                  />
                </div>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecordingItem({ recording, onPlay }: { recording: any; onPlay: (recording: any) => void }) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const handleShare = async () => {
    // Simulate generating share URL
    const url = `https://recordings.zoom.us/share/${recording.id}`
    setShareUrl(url)
    setShareDialogOpen(true)
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
  }

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" alt="Recording" />
                <AvatarFallback>
                  <FileAudio className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                {recording.direction === "inbound" ? (
                  <PhoneIncoming className="h-4 w-4 text-green-500" />
                ) : (
                  <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {recording.direction === "inbound" ? recording.caller_number : recording.callee_number}
                </p>
                <Badge variant={recording.recording_type === "automatic" ? "default" : "secondary"} className="text-xs">
                  {recording.recording_type}
                </Badge>
                {recording.transcript?.status === "completed" && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Transcript
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(recording.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(recording.start_time), "MMM d, yyyy")}
                </span>
                <span>{formatFileSize(recording.file_size)}</span>
              </div>
              {recording.participants.length > 1 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Participants:</span>
                  {recording.participants.slice(0, 3).map((participant: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {participant.user_name}
                    </Badge>
                  ))}
                  {recording.participants.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{recording.participants.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onPlay(recording)}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPlay(recording)}>
                  <Play className="mr-2 h-4 w-4" />
                  Play Recording
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                {recording.transcript?.status === "completed" && (
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    View Transcript
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Recording</DialogTitle>
            <DialogDescription>Generate a shareable link for this call recording</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Type</label>
              <Select defaultValue="internal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal (Company Only)</SelectItem>
                  <SelectItem value="public">Public Link</SelectItem>
                  <SelectItem value="password">Password Protected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry</label>
              <Select defaultValue="7">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {shareUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Share URL</label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button variant="outline" size="sm" onClick={copyShareUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare}>Generate Link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function TranscriptViewer({ recording }: { recording: any }) {
  if (!recording.transcript || recording.transcript.status !== "completed") {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Transcript Available</h3>
          <p className="text-muted-foreground mb-4">
            {recording.transcript?.status === "processing"
              ? "Transcript is being generated..."
              : "Generate a transcript for this recording"}
          </p>
          <Button>Generate Transcript</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Call Transcript
        </CardTitle>
        <CardDescription>
          Confidence: {Math.round(recording.transcript.confidence * 100)}% • Language: {recording.transcript.language}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{recording.transcript.content}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function CallRecordingsView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecording, setSelectedRecording] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(75)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Use real data from the API
  const { recordings, loading, error, refetch } = useCallRecordings()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-muted-foreground">Loading recordings...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-red-600">Error loading recordings: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  const filteredRecordings = recordings?.filter(
    (recording) =>
      recording.caller_number.includes(searchTerm) ||
      recording.callee_number.includes(searchTerm) ||
      recording.participants.some((p) => p.user_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handlePlayRecording = (recording: any) => {
    setSelectedRecording(recording)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  useEffect(() => {
    let audio: HTMLAudioElement | null = null
    const updateTime = () => {
      if (audio) {
        setCurrentTime(audio.currentTime)
      }
    }
    const handleEnded = () => setIsPlaying(false)

    if (selectedRecording) {
      audio = audioRef.current
      if (!audio) return

      audio.addEventListener("timeupdate", updateTime)
      audio.addEventListener("ended", handleEnded)
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", updateTime)
        audio.removeEventListener("ended", handleEnded)
      }
    }
  }, [selectedRecording])

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordings?.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(recordings?.reduce((sum, r) => sum + r.duration, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(recordings?.reduce((sum, r) => sum + r.file_size, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Transcripts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recordings?.filter((r) => r.transcript?.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recordings by phone number or participant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recordings</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
            <SelectItem value="on_demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recordings List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Recordings</CardTitle>
              <CardDescription>
                {filteredRecordings?.length} of {recordings?.length} recordings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {filteredRecordings?.map((recording) => (
                    <RecordingItem key={recording.id} recording={recording} onPlay={handlePlayRecording} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Player and Details */}
        <div className="space-y-4">
          {selectedRecording ? (
            <>
              <AudioPlayer
                recording={selectedRecording}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                currentTime={currentTime}
                duration={selectedRecording.duration}
                onSeek={handleSeek}
                volume={volume}
                onVolumeChange={handleVolumeChange}
              />
              <TranscriptViewer recording={selectedRecording} />
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FileAudio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Recording Selected</h3>
                <p className="text-muted-foreground">Select a recording to play and view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden Audio Element */}
      {selectedRecording && (
        <audio
          ref={audioRef}
          src={selectedRecording.play_url}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.volume = volume / 100
            }
          }}
        />
      )}
    </div>
  )
}
