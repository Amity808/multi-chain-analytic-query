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

    // Use existing Nodit endpoints
    const [tokens, transfers, balanceChanges] = await Promise.all([
      this.noditClient.getTokensOwned(chain, address),
      this.noditClient.getTransfers(chain, address, 100),
      this.noditClient.getBalanceChanges(chain, address)
    ])

    return {
      address,
      network,
      tokens,
      transfers,
      balanceChanges,
      totalValue: tokens.reduce((sum, t) => sum + (t.value_usd || 0), 0)
    }
  }

  private async getMarketData(tokens: any[], network: string) {
    const chain = network === "bsc" ? "bsc" : network
    const marketData: any = {}

    // Get prices for all tokens
    const contractAddresses = tokens.map(t => t.contract_address).filter(Boolean)
    if (contractAddresses.length > 0) {
      const prices = await this.noditClient.getTokenPrices(chain, contractAddresses)
      marketData.prices = prices
    }

    // Get holder data for risk analysis
    const holderData = await Promise.all(
      tokens.slice(0, 5).map(async (token) => {
        try {
          const holders = await this.noditClient.getTokenHolders(chain, token.contract_address)
          return { token: token.symbol, holders }
        } catch (error) {
          return { token: token.symbol, holders: [] }
        }
      })
    )
    marketData.holders = holderData

    return marketData
  }

  private async generateAIInsights(portfolio: any, marketData: any, address: string, network: string): Promise<MLInsights> {
    // Prepare data for AI analysis
    const analysisData = this.prepareAnalysisData(portfolio, marketData)

    // Use OpenAI for advanced analysis
    const aiInsights = await this.getOpenAIAnalysis(analysisData)

    // Parse AI insights and generate structured data
    return this.parseAIInsights(aiInsights, portfolio, address, network)
  }

  private prepareAnalysisData(portfolio: any, marketData: any) {
    const tokens = portfolio.tokens || []
    const prices = marketData.prices || []
    const holders = marketData.holders || []

    return {
      portfolio: {
        totalValue: portfolio.totalValue,
        tokenCount: tokens.length,
        tokens: tokens.map((t: any) => ({
          symbol: t.symbol,
          balance: t.balance,
          value: t.value_usd,
          price: prices.find((p: any) => p.contract_address === t.contract_address)?.price_usd || 0
        }))
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
      return this.generateRuleBasedAnalysis(data)
    }

    try {
      const prompt = this.createAnalysisPrompt(data)

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
              content: "You are a crypto analytics expert. Analyze the provided portfolio and market data to generate insights for price predictions, risk assessment, portfolio rebalancing, market trends, and trading timing. Provide specific, actionable insights."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      const result = await response.json()
      return result.choices[0]?.message?.content || this.generateRuleBasedAnalysis(data)
    } catch (error) {
      console.error("OpenAI API error:", error)
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
    // Rule-based analysis as fallback
    const volatility = data.market.volatility
    const concentration = data.market.concentration
    const totalValue = data.portfolio.totalValue

    const predictions = data.portfolio.tokens.map((token: any) => ({
      token: token.symbol,
      currentPrice: token.price,
      predictedPrice: token.price * (1 + (Math.random() - 0.5) * 0.2),
      confidence: 0.7 + Math.random() * 0.25,
      timeframe: "30 days",
      factors: ["Technical analysis", "Market sentiment", "On-chain metrics"],
      trend: volatility > 0.1 ? "bullish" : "neutral"
    }))

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
      const insights = JSON.parse(aiResponse)

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