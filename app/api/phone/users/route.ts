import { NextResponse } from "next/server"
import { getPhoneUsers, getSites, getCommonAreaPhones } from "@/lib/zoom-api"

export async function GET() {
  try {
    const [users, sites, commonAreaPhones] = await Promise.all([getPhoneUsers(), getSites(), getCommonAreaPhones()])

    // Combine users and common area phones
    const allUsers = [
      ...users.map((user: any) => ({
        ...user,
        type: "user",
        site: sites.find((site: any) => site.id === user.site_id)?.name || "Unknown Site",
      })),
      ...commonAreaPhones.map((phone: any) => ({
        ...phone,
        type: "common_area",
        site: sites.find((site: any) => site.id === phone.site_id)?.name || "Unknown Site",
      })),
    ]

    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error("Error fetching phone users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
