import { NextRequest, NextResponse } from "next/server"
import { getNoditClient } from "@/lib/nodit"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { accountAddress, chain = "ethereum", limit = 50 } = body

        if (!accountAddress) {
            return NextResponse.json({ error: "Account address is required" }, { status: 400 })
        }

        const noditClient = getNoditClient()
        const transfers = await noditClient.getTransfers(chain, accountAddress, limit)

        return NextResponse.json({ items: transfers })
    } catch (error) {
        console.error("Error fetching transfers:", error)
        return NextResponse.json(
            { error: "Failed to fetch transfers" },
            { status: 500 }
        )
    }
} 