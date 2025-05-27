"use server"

import { makeZoomPhoneAPIRequest } from "./zoom-api"

export interface CallRecording {
  id: string
  call_id: string
  recording_type: "automatic" | "on_demand"
  file_type: "mp3" | "mp4" | "wav"
  file_size: number
  duration: number
  download_url: string
  play_url: string
  start_time: string
  end_time: string
  participants: {
    user_id: string
    user_name: string
    user_email: string
    join_time: string
    leave_time: string
  }[]
  caller_number: string
  callee_number: string
  direction: "inbound" | "outbound"
  status: "completed" | "processing" | "failed"
  transcript?: {
    id: string
    status: "completed" | "processing" | "failed"
    content: string
    confidence: number
    language: string
  }
  created_at: string
  updated_at: string
}

export async function getCallRecordings(
  userId?: string,
  from?: string,
  to?: string,
  pageSize = 50,
  nextPageToken?: string,
) {
  try {
    const params = new URLSearchParams()
    if (userId) params.append("user_id", userId)
    if (from) params.append("from", from)
    if (to) params.append("to", to)
    params.append("page_size", pageSize.toString())
    if (nextPageToken) params.append("next_page_token", nextPageToken)

    const response = await makeZoomPhoneAPIRequest(`/call_recordings?${params.toString()}`)
    return {
      recordings: response.recordings || [],
      next_page_token: response.next_page_token,
      total_records: response.total_records,
    }
  } catch (error) {
    console.error("Error fetching call recordings:", error)
    return { recordings: [], next_page_token: null, total_records: 0 }
  }
}

export async function getCallRecording(recordingId: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/call_recordings/${recordingId}`)
    return response
  } catch (error) {
    console.error("Error fetching call recording:", error)
    throw error
  }
}

export async function deleteCallRecording(recordingId: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/call_recordings/${recordingId}`, {
      method: "DELETE",
    })
    return response
  } catch (error) {
    console.error("Error deleting call recording:", error)
    throw error
  }
}

export async function getRecordingTranscript(recordingId: string) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/call_recordings/${recordingId}/transcript`)
    return response
  } catch (error) {
    console.error("Error fetching recording transcript:", error)
    throw error
  }
}

export async function generateRecordingTranscript(recordingId: string, language = "en-US") {
  try {
    const response = await makeZoomPhoneAPIRequest(`/call_recordings/${recordingId}/transcript`, {
      method: "POST",
      body: JSON.stringify({
        language: language,
      }),
    })
    return response
  } catch (error) {
    console.error("Error generating recording transcript:", error)
    throw error
  }
}

export async function updateRecordingSettings(settings: {
  auto_recording?: boolean
  auto_recording_direction?: "inbound" | "outbound" | "both"
  auto_delete_days?: number
  cloud_recording_retention?: number
}) {
  try {
    const response = await makeZoomPhoneAPIRequest("/settings/recording", {
      method: "PATCH",
      body: JSON.stringify(settings),
    })
    return response
  } catch (error) {
    console.error("Error updating recording settings:", error)
    throw error
  }
}

export async function getRecordingSettings() {
  try {
    const response = await makeZoomPhoneAPIRequest("/settings/recording")
    return response
  } catch (error) {
    console.error("Error fetching recording settings:", error)
    return null
  }
}

export async function shareRecording(
  recordingId: string,
  shareSettings: {
    share_type: "public" | "internal" | "password"
    password?: string
    expiry_days?: number
    allow_download?: boolean
  },
) {
  try {
    const response = await makeZoomPhoneAPIRequest(`/call_recordings/${recordingId}/share`, {
      method: "POST",
      body: JSON.stringify(shareSettings),
    })
    return response
  } catch (error) {
    console.error("Error sharing recording:", error)
    throw error
  }
}
