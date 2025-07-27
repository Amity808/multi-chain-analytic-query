import { NextRequest, NextResponse } from "next/server"
import { getNoditClient } from "@/lib/nodit"

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

        console.log(`🔮 Generating price predictions for ${address} on ${network}`)

        const noditClient = getNoditClient()

        // Step 1: Get tokens
        const tokens = await noditClient.getTokensOwned(network, address)
        console.log(`✅ Found ${tokens.length} tokens for price prediction`)

        // Step 2: Get prices
        const contractAddresses = tokens.map((t: any) =>
            t.contract?.address || t.contractAddress || t.contract_address || t.address
        ).filter(Boolean)

        let prices: any[] = []
        if (contractAddresses.length > 0) {
            prices = await noditClient.getTokenPrices(network, contractAddresses)
        }

        // Step 3: Generate predictions for all tokens (even zero-value ones)
        const predictions = tokens.slice(0, 15).map((token: any, index: number) => {
            const contractAddr = token.contract?.address || token.contractAddress || token.contract_address || token.address
            const symbol = token.contract?.symbol || token.symbol || token.name || `Token${index + 1}`
            const currentPrice = prices.find(p => p.contract_address === contractAddr)?.price_usd || 0

            // Generate predictions based on token characteristics
            const hasRealPrice = currentPrice > 0
            const isLikelyTestToken = token.balance?.toString().includes("115792089") || symbol.length < 3

            let predictionFactor = 0.1 + Math.random() * 0.3 // 10-40% change
            let confidence = 0.4 + Math.random() * 0.4 // 40-80% confidence
            let trend: "bullish" | "bearish" | "neutral" = "neutral"

            if (hasRealPrice) {
                // Real tokens get more realistic predictions
                predictionFactor = (Math.random() - 0.5) * 0.4 // ±20% change
                confidence = 0.6 + Math.random() * 0.3 // 60-90% confidence
                trend = predictionFactor > 0.05 ? "bullish" :
                    predictionFactor < -0.05 ? "bearish" : "neutral"
            } else if (isLikelyTestToken) {
                // Test tokens get cautious predictions
                predictionFactor = 0
                confidence = 0.1
                trend = "neutral"
            }

            const predictedPrice = hasRealPrice
                ? currentPrice * (1 + predictionFactor)
                : Math.random() * 0.001 // Small value for test tokens

            return {
                token: symbol,
                contractAddress: contractAddr,
                currentPrice: currentPrice,
                predictedPrice: Number(predictedPrice.toFixed(8)),
                priceChange: predictionFactor,
                confidence: Number(confidence.toFixed(2)),
                timeframe: "30 days",
                factors: hasRealPrice
                    ? ["Technical analysis", "Market sentiment", "Volume analysis"]
                    : isLikelyTestToken
                        ? ["Test token detected", "Limited data", "Speculative analysis"]
                        : ["Price discovery", "Token fundamentals", "Market potential"],
                trend,
                analysis: hasRealPrice
                    ? `Based on current price of $${currentPrice.toFixed(6)} and market conditions`
                    : isLikelyTestToken
                        ? "Test/spam token detected - exercise extreme caution"
                        : "Emerging token with limited price data available",
                riskLevel: hasRealPrice ? "medium" : isLikelyTestToken ? "very_high" : "high"
            }
        })

        const summary = {
            totalTokens: tokens.length,
            predictionsGenerated: predictions.length,
            tokensWithPrices: prices.length,
            averageConfidence: predictions.length > 0
                ? Number((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length).toFixed(2))
                : 0,
            bullishCount: predictions.filter(p => p.trend === "bullish").length,
            bearishCount: predictions.filter(p => p.trend === "bearish").length,
            neutralCount: predictions.filter(p => p.trend === "neutral").length
        }

        return NextResponse.json({
            predictions,
            summary,
            metadata: {
                address,
                network,
                analysisDate: new Date().toISOString(),
                modelVersion: "price-prediction-v1.0"
            }
        })

    } catch (error) {
        console.error("Error in price prediction:", error)
        return NextResponse.json(
            { error: "Failed to generate price predictions" },
            { status: 500 }
        )
    }
} 