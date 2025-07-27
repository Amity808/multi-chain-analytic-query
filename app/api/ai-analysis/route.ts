import { NextRequest, NextResponse } from "next/server"
import { aiAnalysisService } from "@/lib/ai-analysis-service"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { address, network } = body

        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 })
        }

        if (!network) {
            return NextResponse.json({ error: "Network is required" }, { status: 400 })
        }

        console.log(`🤖 Starting AI analysis for ${address} on ${network}`)

        const insights = await aiAnalysisService.analyzePortfolio(address, network)

        return NextResponse.json(insights)
    } catch (error) {
        console.error("Error in AI analysis:", error)
        return NextResponse.json(
            { error: "Failed to analyze portfolio" },
            { status: 500 }
        )
    }
} 