import { NextRequest, NextResponse } from "next/server"
import { getNoditClient } from "@/lib/nodit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractAddresses, chain = "ethereum" } = body

    if (!contractAddresses || !Array.isArray(contractAddresses)) {
      return NextResponse.json({ error: "Contract addresses array is required" }, { status: 400 })
    }

    const noditClient = getNoditClient()
    const prices = await noditClient.getTokenPrices(chain, contractAddresses)

    return NextResponse.json({ prices })
  } catch (error) {
    console.error("Error fetching token prices:", error)
    return NextResponse.json(
      { error: "Failed to fetch token prices" },
      { status: 500 }
    )
  }
} 