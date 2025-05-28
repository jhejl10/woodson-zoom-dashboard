// Mock data for development/preview environments
export const mockUsers = [
  {
    id: "user1",
    email: "john.doe@company.com",
    first_name: "John",
    last_name: "Doe",
    display_name: "John Doe",
    phone_number: "+1-555-0101",
    extension: "101",
    status: "available",
    site_id: "site1",
    cost_center: "Sales",
    department: "Sales Team",
  },
  {
    id: "user2",
    email: "jane.smith@company.com",
    first_name: "Jane",
    last_name: "Smith",
    display_name: "Jane Smith",
    phone_number: "+1-555-0102",
    extension: "102",
    status: "busy",
    site_id: "site1",
    cost_center: "Support",
    department: "Customer Support",
  },
  {
    id: "user3",
    email: "mike.johnson@company.com",
    first_name: "Mike",
    last_name: "Johnson",
    display_name: "Mike Johnson",
    phone_number: "+1-555-0103",
    extension: "103",
    status: "offline",
    site_id: "site2",
    cost_center: "Engineering",
    department: "Development",
  },
]

export const mockQueues = [
  {
    id: "queue1",
    name: "Sales Queue",
    description: "Main sales line",
    phone_number: "+1-555-0200",
    extension: "200",
    max_wait_time: 300,
    wrap_up_time: 30,
    members: ["user1", "user2"],
    waiting_calls: 2,
    longest_wait_time: 45,
  },
  {
    id: "queue2",
    name: "Support Queue",
    description: "Customer support line",
    phone_number: "+1-555-0300",
    extension: "300",
    max_wait_time: 600,
    wrap_up_time: 60,
    members: ["user2", "user3"],
    waiting_calls: 1,
    longest_wait_time: 120,
  },
]

export const mockCalls = [
  {
    id: "call1",
    caller_number: "+1-555-9876",
    callee_number: "+1-555-0101",
    direction: "inbound",
    start_time: new Date(Date.now() - 300000).toISOString(),
    end_time: new Date(Date.now() - 60000).toISOString(),
    duration: 240,
    result: "completed",
    user_id: "user1",
  },
  {
    id: "call2",
    caller_number: "+1-555-0102",
    callee_number: "+1-555-5432",
    direction: "outbound",
    start_time: new Date(Date.now() - 600000).toISOString(),
    end_time: new Date(Date.now() - 480000).toISOString(),
    duration: 120,
    result: "completed",
    user_id: "user2",
  },
]

export const mockVoicemails = [
  {
    id: "vm1",
    caller_number: "+1-555-7890",
    callee_number: "+1-555-0101",
    date_time: new Date(Date.now() - 3600000).toISOString(),
    duration: 45,
    file_size: 1024000,
    download_url: "/mock/voicemail1.mp3",
    transcript: "Hi, this is a test voicemail message.",
    user_id: "user1",
  },
]

export const mockRecordings = [
  {
    id: "rec1",
    caller_number: "+1-555-1111",
    callee_number: "+1-555-0101",
    date_time: new Date(Date.now() - 7200000).toISOString(),
    duration: 180,
    file_size: 5120000,
    download_url: "/mock/recording1.mp3",
    user_id: "user1",
  },
]
