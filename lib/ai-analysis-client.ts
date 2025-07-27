import type { MLInsights } from "./ai-analysis-service"

class AIAnalysisClient {
    async analyzePortfolio(address: string, network: string): Promise<MLInsights> {
        try {
            console.log(`🤖 Starting client-side AI analysis for ${address} on ${network}`)

            const response = await fetch("/api/ai-analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address,
                    network,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to analyze portfolio")
            }

            const insights = await response.json()
            console.log("✅ AI analysis completed successfully")
            return insights
        } catch (error) {
            console.error("❌ Client-side AI analysis failed:", error)
            throw error
        }
    }
}

export const aiAnalysisClient = new AIAnalysisClient() 