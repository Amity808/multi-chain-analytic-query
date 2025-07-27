import { NextRequest, NextResponse } from "next/server"
import { getNoditClient } from "@/lib/nodit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountAddress, chain = "ethereum" } = body

    if (!accountAddress) {
      return NextResponse.json({ error: "Account address is required" }, { status: 400 })
    }

    const noditClient = getNoditClient()
    const tokens = await noditClient.getTokensOwned(chain, accountAddress)

    return NextResponse.json({ items: tokens })
  } catch (error) {
    console.error("Error fetching tokens:", error)
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    )
  }
} 