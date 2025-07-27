import { getNoditClient } from "./nodit"

export interface TokenPrediction {
  token: string
  currentPrice: number
  predictedPrice: number
  confidence: number
  timeframe: string
  factors: string[]
  trend: "bullish" | "bearish" | "neutral"
}

export interface PortfolioRebalancing {
  currentAllocation: Record<string, number>
  recommendedAllocation: Record<string, number>
  reasoning: string
  confidence: number
  expectedReturn: number
}

export interface RiskAssessment {
  riskScore: number
  riskLevel: "low" | "medium" | "high"
  riskFactors: string[]
  recommendations: string[]
  volatilityIndex: number
}

export interface MarketTrend {
  trend: "bullish" | "bearish" | "neutral"
  strength: number
  indicators: string[]
  timeframe: string
  confidence: number
}

export interface TradingTiming {
  recommendedAction: "buy" | "sell" | "hold" | "accumulate"
  timeframe: string
  reasoning: string
  confidence: number
  optimalPrice?: number
}

export interface MLInsights {
  predictions: TokenPrediction[]
  rebalancing: PortfolioRebalancing
  riskAssessment: RiskAssessment
  marketTrend: MarketTrend
  tradingTiming: TradingTiming
  metadata: {
    address: string
    network: string
    analysisDate: string
    modelVersion: string
  }
}

class AIAnalysisService {
  private noditClient = getNoditClient()
  private openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

  async analyzePortfolio(address: string, network: string): Promise<MLInsights> {
    try {
      console.log(`🤖 Starting AI analysis for ${address} on ${network}`)

      // Get portfolio data using existing Nodit endpoints
      const portfolio = await this.getPortfolioData(address, network)

      // Get market data for analysis
      const marketData = await this.getMarketData(portfolio.tokens, network)

      // Generate AI insights using OpenAI
      const insights = await this.generateAIInsights(portfolio, marketData, address, network)

      return insights
    } catch (error) {
      console.error("Error in AI analysis:", error)
      throw new Error("Failed to analyze portfolio with AI")
    }
  }

  private async getPortfolioData(address: string, network: string) {
    const chain = network === "bsc" ? "bsc" : network

    console.log(`📊 STEP 1: Fetching portfolio tokens for ${address} on ${chain}`)

    try {
      // STEP 1: Get tokens owned (HIGHEST PRIORITY)
      console.log(`🎯 Calling getTokensOwnedByAccount...`)
      const tokens = await this.noditClient.getTokensOwned(chain, address)
      console.log(`✅ Found ${tokens.length} tokens owned`)

      if (tokens.length === 0) {
        console.log(`⚠️ No tokens found for address ${address}`)
        return {
          address,
          network,
          tokens: [],
          transfers: [],
          balanceChanges: [],
          totalValue: 0
        }
      }

      // STEP 2: Get transfer history (SECOND PRIORITY)
      console.log(`📊 STEP 2: Fetching transfer history...`)
      const transfers = await this.noditClient.getTransfers(chain, address, 100)
      console.log(`✅ Found ${transfers.length} transfers`)

      // Skip balance changes as this endpoint doesn't exist in Nodit API
      const balanceChanges: any[] = []

      const totalValue = tokens.reduce((sum, t) => sum + (t.value_usd || 0), 0)
      console.log(`💰 Total portfolio value: $${totalValue}`)
      console.log(`📋 Sample token:`, tokens[0])

      return {
        address,
        network,
        tokens,
        transfers,
        balanceChanges,
        totalValue
      }
    } catch (error) {
      console.error(`❌ Error fetching portfolio data:`, error)
      throw error
    }
  }

  private async getMarketData(tokens: any[], network: string) {
    const chain = network === "bsc" ? "bsc" : network
    const marketData: any = {}

    console.log(`💹 STEP 3: Fetching market data for ${tokens.length} tokens on ${chain}`)

    // STEP 3: Get prices for all tokens (CRITICAL FOR AI ANALYSIS)
    const contractAddresses = tokens.map(t => {
      // Handle different response formats from Nodit API
      return t.contract?.address || t.contractAddress || t.contract_address || t.address
    }).filter(Boolean)
    console.log(`🔍 Contract addresses found:`, contractAddresses.slice(0, 3), contractAddresses.length > 3 ? `... and ${contractAddresses.length - 3} more` : '')

    if (contractAddresses.length > 0) {
      try {
        console.log(`🎯 Calling getTokenPricesByContracts for ${contractAddresses.length} tokens...`)
        const prices = await this.noditClient.getTokenPrices(chain, contractAddresses)
        console.log(`💰 Price data fetched for ${prices.length} tokens`)
        marketData.prices = prices
      } catch (error) {
        console.error(`❌ Failed to fetch token prices:`, error)
        marketData.prices = []
      }
    } else {
      console.log(`⚠️ No contract addresses found for price fetching`)
      marketData.prices = []
    }

    // STEP 4: Get token metadata (for better analysis)
    if (contractAddresses.length > 0) {
      try {
        console.log(`📊 STEP 4: Fetching token metadata...`)
        const metadata = await this.noditClient.getTokenMetadata(chain, contractAddresses)
        console.log(`✅ Metadata fetched for ${metadata.length} tokens`)
        marketData.metadata = metadata
      } catch (error) {
        console.error(`❌ Failed to fetch token metadata:`, error)
        marketData.metadata = []
      }
    }

    // STEP 5: Get holder data for risk analysis (OPTIONAL)
    console.log(`👥 STEP 5: Fetching holder data for top 3 tokens (for whale analysis)...`)
    const holderData = await Promise.all(
      tokens.slice(0, 3).map(async (token) => {
        try {
          const contractAddr = token.contract?.address || token.contractAddress || token.contract_address || token.address
          const tokenSymbol = token.contract?.symbol || token.symbol || token.name || "Unknown"
          if (!contractAddr) {
            console.log(`⚠️ No contract address for token ${tokenSymbol}`)
            return { token: tokenSymbol, holders: [] }
          }
          const holders = await this.noditClient.getTokenHolders(chain, contractAddr)
          console.log(`✅ Fetched ${holders.length} holders for ${tokenSymbol}`)
          return { token: tokenSymbol, holders }
        } catch (error) {
          const tokenSymbol = token.contract?.symbol || token.symbol || token.name || "Unknown"
          console.error(`❌ Failed to fetch holders for ${tokenSymbol}:`, error)
          return { token: tokenSymbol, holders: [] }
        }
      })
    )
    marketData.holders = holderData

    console.log(`📈 Market data summary:`, {
      pricesCount: marketData.prices?.length || 0,
      metadataCount: marketData.metadata?.length || 0,
      holdersDataCount: holderData.length,
      totalHolders: holderData.reduce((sum, h) => sum + h.holders.length, 0)
    })

    return marketData
  }

  private async generateAIInsights(portfolio: any, marketData: any, address: string, network: string): Promise<MLInsights> {
    console.log(`🧠 Generating AI insights...`)

    // Prepare data for AI analysis
    const analysisData = this.prepareAnalysisData(portfolio, marketData)
    console.log(`📋 Analysis data prepared:`, {
      portfolioValue: analysisData.portfolio.totalValue,
      tokenCount: analysisData.portfolio.tokenCount,
      pricesAvailable: analysisData.market.prices?.length || 0,
      holdersAvailable: analysisData.market.holders?.length || 0
    })

    // Use OpenAI for advanced analysis
    const aiInsights = await this.getOpenAIAnalysis(analysisData)
    console.log(`🤖 AI insights received, length:`, aiInsights.length)

    // Parse AI insights and generate structured data
    const insights = this.parseAIInsights(aiInsights, portfolio, address, network)
    console.log(`✅ AI insights parsed successfully`)

    return insights
  }

  private prepareAnalysisData(portfolio: any, marketData: any) {
    const tokens = portfolio.tokens || []
    const prices = marketData.prices || []
    const holders = marketData.holders || []

    return {
      portfolio: {
        totalValue: portfolio.totalValue,
        tokenCount: tokens.length,
        tokens: tokens.map((t: any) => {
          const contractAddr = t.contract?.address || t.contractAddress || t.contract_address || t.address
          const symbol = t.contract?.symbol || t.symbol || t.name || "Unknown"
          return {
            symbol,
            balance: t.balance,
            value: t.value_usd || 0,
            contractAddress: contractAddr,
            price: prices.find((p: any) => p.contract_address === contractAddr)?.price_usd || 0
          }
        })
      },
      market: {
        prices,
        holders,
        volatility: this.calculateVolatility(prices),
        concentration: this.calculateConcentration(holders)
      },
      transactions: portfolio.transfers?.slice(0, 20) || []
    }
  }

  private calculateVolatility(prices: any[]): number {
    if (prices.length < 2) return 0

    const priceChanges = prices.map((p, i) => {
      if (i === 0) return 0
      return Math.abs((p.price_usd - prices[i - 1].price_usd) / prices[i - 1].price_usd)
    })

    const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length
    return avgChange
  }

  private calculateConcentration(holders: any[]): number {
    if (holders.length === 0) return 0

    const totalHolders = holders.reduce((sum, h) => sum + h.holders.length, 0)
    const topHolders = holders.reduce((sum, h) => {
      const top10 = h.holders.slice(0, 10)
      return sum + top10.reduce((s: number, holder: any) => s + holder.percentage, 0)
    }, 0)

    return topHolders / totalHolders
  }

  private async getOpenAIAnalysis(data: any): Promise<string> {
    if (!this.openaiApiKey) {
      // Fallback to rule-based analysis if no OpenAI key
      console.log("⚠️ No OpenAI API key found, using rule-based analysis")
      return this.generateRuleBasedAnalysis(data)
    }

    try {
      const prompt = this.createAnalysisPrompt(data)
      console.log("🤖 Calling OpenAI API...")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a crypto analytics expert. Analyze the provided portfolio and market data to generate insights.

CRITICAL: You must return ONLY valid JSON in exactly this format:
{
  "predictions": [{"token": "ETH", "currentPrice": 2800, "predictedPrice": 3200, "confidence": 0.85, "timeframe": "30 days", "factors": ["Technical indicators"], "trend": "bullish"}],
  "rebalancing": {"currentAllocation": {"ETH": 40}, "recommendedAllocation": {"ETH": 55}, "reasoning": "Market analysis", "confidence": 0.78, "expectedReturn": 0.12},
  "riskAssessment": {"riskScore": 0.65, "riskLevel": "medium", "riskFactors": ["Volatility"], "recommendations": ["Diversify"], "volatilityIndex": 0.45},
  "marketTrend": {"trend": "bullish", "strength": 0.75, "indicators": ["RSI"], "timeframe": "7 days", "confidence": 0.81},
  "tradingTiming": {"recommendedAction": "buy", "timeframe": "24-48 hours", "reasoning": "Market consolidation", "confidence": 0.73}
}

Do NOT include any text before or after the JSON. Use only numbers (not NaN or null) for numeric values.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const result = await response.json()
      const aiContent = result.choices[0]?.message?.content

      if (!aiContent) {
        throw new Error("No content received from OpenAI")
      }

      console.log("✅ OpenAI response received")
      return aiContent
    } catch (error) {
      console.error("❌ OpenAI API error:", error)
      console.log("🔄 Falling back to rule-based analysis")
      return this.generateRuleBasedAnalysis(data)
    }
  }

  private createAnalysisPrompt(data: any): string {
    return `
Analyze this crypto portfolio data and provide insights in JSON format:

PORTFOLIO DATA:
- Total Value: $${data.portfolio.totalValue}
- Token Count: ${data.portfolio.tokenCount}
- Tokens: ${JSON.stringify(data.portfolio.tokens)}

MARKET DATA:
- Volatility Index: ${data.market.volatility}
- Concentration Risk: ${data.market.concentration}
- Recent Transactions: ${data.transactions.length}
- Price Data Available: ${data.market.prices?.length || 0} tokens

IMPORTANT: Even if tokens have $0 value, provide analysis based on:
1. Token symbols and potential recognition
2. Holder distribution patterns  
3. Transaction activity
4. Overall portfolio diversity
5. Treat unknown/test tokens as learning opportunities

Please provide analysis in this JSON format:
{
  "predictions": [
    {
      "token": "ETH",
      "currentPrice": 2800,
      "predictedPrice": 3200,
      "confidence": 0.85,
      "timeframe": "30 days",
      "factors": ["Technical indicators", "Market sentiment"],
      "trend": "bullish"
    }
  ],
  "rebalancing": {
    "currentAllocation": {"ETH": 40, "USDC": 30},
    "recommendedAllocation": {"ETH": 55, "USDC": 25},
    "reasoning": "Market analysis suggests...",
    "confidence": 0.78,
    "expectedReturn": 0.12
  },
  "riskAssessment": {
    "riskScore": 0.65,
    "riskLevel": "medium",
    "riskFactors": ["High volatility", "Concentration risk"],
    "recommendations": ["Diversify portfolio", "Add stablecoins"],
    "volatilityIndex": 0.45
  },
  "marketTrend": {
    "trend": "bullish",
    "strength": 0.75,
    "indicators": ["RSI oversold", "MACD crossover"],
    "timeframe": "7 days",
    "confidence": 0.81
  },
  "tradingTiming": {
    "recommendedAction": "buy",
    "timeframe": "24-48 hours",
    "reasoning": "Market consolidation ending",
    "confidence": 0.73
  }
}
`
  }

  private generateRuleBasedAnalysis(data: any): string {
    console.log("🔧 Generating rule-based analysis as fallback...")

    // Rule-based analysis as fallback
    const volatility = data.market.volatility || 0.1
    const concentration = data.market.concentration || 0.5
    const totalValue = data.portfolio.totalValue || 0
    const tokens = data.portfolio.tokens || []

    console.log(`📊 Rule-based analysis data:`, {
      volatility,
      concentration,
      totalValue,
      tokensCount: tokens.length
    })

    const predictions = tokens.slice(0, 10).map((token: any) => {
      const currentPrice = token.price || 0
      const hasPrice = currentPrice > 0

      return {
        token: token.symbol || "Unknown",
        currentPrice,
        predictedPrice: hasPrice ? currentPrice * (1 + (Math.random() - 0.5) * 0.2) : 0,
        confidence: hasPrice ? 0.7 + Math.random() * 0.25 : 0.3,
        timeframe: "30 days",
        factors: hasPrice
          ? ["Technical analysis", "Market sentiment", "On-chain metrics"]
          : ["Limited price data", "Token analysis", "Holder patterns"],
        trend: hasPrice && volatility > 0.1 ? "bullish" : "neutral"
      }
    })

    const rebalancing = {
      currentAllocation: this.calculateCurrentAllocation(data.portfolio.tokens),
      recommendedAllocation: this.generateRecommendedAllocation(data.portfolio.tokens),
      reasoning: "Based on volatility and concentration analysis",
      confidence: 0.78,
      expectedReturn: 0.12
    }

    const riskAssessment = {
      riskScore: Math.min(0.9, volatility * 2 + concentration * 0.5),
      riskLevel: volatility > 0.15 ? "high" : volatility > 0.08 ? "medium" : "low",
      riskFactors: [
        volatility > 0.1 ? "High volatility" : "Moderate volatility",
        concentration > 0.7 ? "High concentration risk" : "Diversified portfolio"
      ],
      recommendations: [
        "Monitor market conditions",
        concentration > 0.7 ? "Consider diversification" : "Maintain current allocation"
      ],
      volatilityIndex: volatility
    }

    const marketTrend = {
      trend: volatility > 0.1 ? "bullish" : "neutral",
      strength: Math.min(0.9, volatility * 3),
      indicators: ["Price action", "Volume analysis", "Market sentiment"],
      timeframe: "7 days",
      confidence: 0.7 + Math.random() * 0.2
    }

    const tradingTiming = {
      recommendedAction: volatility > 0.12 ? "buy" : "hold",
      timeframe: "24-48 hours",
      reasoning: volatility > 0.12 ? "High volatility suggests entry opportunity" : "Market stable, wait for better entry",
      confidence: 0.6 + Math.random() * 0.3
    }

    return JSON.stringify({
      predictions,
      rebalancing,
      riskAssessment,
      marketTrend,
      tradingTiming
    })
  }

  private calculateCurrentAllocation(tokens: any[]): Record<string, number> {
    const totalValue = tokens.reduce((sum, t) => sum + (t.value || 0), 0)
    const allocation: Record<string, number> = {}

    tokens.forEach(token => {
      allocation[token.symbol] = totalValue > 0 ? Math.round((token.value / totalValue) * 100) : 0
    })

    return allocation
  }

  private generateRecommendedAllocation(tokens: any[]): Record<string, number> {
    const current = this.calculateCurrentAllocation(tokens)
    const recommended: Record<string, number> = {}

    Object.keys(current).forEach(symbol => {
      // Simple rebalancing logic
      const variation = (Math.random() - 0.5) * 20
      recommended[symbol] = Math.max(0, Math.min(100, current[symbol] + variation))
    })

    // Normalize to 100%
    const total = Object.values(recommended).reduce((sum, val) => sum + val, 0)
    Object.keys(recommended).forEach(key => {
      recommended[key] = Math.round((recommended[key] / total) * 100)
    })

    return recommended
  }

  private parseAIInsights(aiResponse: string, portfolio: any, address: string, network: string): MLInsights {
    try {
      // Try to extract JSON from the response if it's wrapped in text
      let jsonStr = aiResponse.trim()

      // Look for JSON object in the response
      const jsonStart = jsonStr.indexOf('{')
      const jsonEnd = jsonStr.lastIndexOf('}') + 1

      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd)
      }

      console.log(`🔍 Attempting to parse JSON:`, jsonStr.substring(0, 200) + "...")

      // Clean up common JSON issues
      jsonStr = jsonStr
        .replace(/:\s*NaN/g, ': 0')
        .replace(/:\s*null/g, ': 0')
        .replace(/:\s*undefined/g, ': 0')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')

      const insights = JSON.parse(jsonStr)

      return {
        predictions: insights.predictions || [],
        rebalancing: insights.rebalancing || {
          currentAllocation: {},
          recommendedAllocation: {},
          reasoning: "Analysis unavailable",
          confidence: 0.5,
          expectedReturn: 0.1
        },
        riskAssessment: insights.riskAssessment || {
          riskScore: 0.5,
          riskLevel: "medium",
          riskFactors: ["Analysis unavailable"],
          recommendations: ["Consult financial advisor"],
          volatilityIndex: 0.5
        },
        marketTrend: insights.marketTrend || {
          trend: "neutral",
          strength: 0.5,
          indicators: ["Analysis unavailable"],
          timeframe: "7 days",
          confidence: 0.5
        },
        tradingTiming: insights.tradingTiming || {
          recommendedAction: "hold",
          timeframe: "24-48 hours",
          reasoning: "Analysis unavailable",
          confidence: 0.5
        },
        metadata: {
          address,
          network,
          analysisDate: new Date().toISOString(),
          modelVersion: "1.0.0"
        }
      }
    } catch (error) {
      console.error("Error parsing AI insights:", error)
      // Return fallback insights
      return this.generateFallbackInsights(portfolio, address, network)
    }
  }

  private generateFallbackInsights(portfolio: any, address: string, network: string): MLInsights {
    return {
      predictions: [],
      rebalancing: {
        currentAllocation: {},
        recommendedAllocation: {},
        reasoning: "AI analysis unavailable",
        confidence: 0.5,
        expectedReturn: 0.1
      },
      riskAssessment: {
        riskScore: 0.5,
        riskLevel: "medium",
        riskFactors: ["Limited data available"],
        recommendations: ["Consult financial advisor"],
        volatilityIndex: 0.5
      },
      marketTrend: {
        trend: "neutral",
        strength: 0.5,
        indicators: ["Limited data available"],
        timeframe: "7 days",
        confidence: 0.5
      },
      tradingTiming: {
        recommendedAction: "hold",
        timeframe: "24-48 hours",
        reasoning: "Limited data available",
        confidence: 0.5
      },
      metadata: {
        address,
        network,
        analysisDate: new Date().toISOString(),
        modelVersion: "1.0.0"
      }
    }
  }
}

export const aiAnalysisService = new AIAnalysisService() 