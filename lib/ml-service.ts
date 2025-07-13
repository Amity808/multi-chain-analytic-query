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

class MLService {
  private noditClient = getNoditClient()
  private openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

  async analyzePortfolio(address: string, network: string): Promise<MLInsights> {
    try {
      // Get portfolio data from Nodit using existing endpoints
      const chain = network === "mainnet" ? "mainnet" : network
      const [tokens, transfers] = await Promise.all([
        this.noditClient.getTokensOwned(chain, address),
        this.noditClient.getTransfers(chain, address, 100)
      ])
      
      const portfolio = {
        tokens: tokens.map(t => t.symbol),
        tokenData: tokens,
        transfers,
        totalValue: tokens.reduce((sum, t) => sum + (t.value_usd || 0), 0)
      }
      
      // Get historical price data
      const priceHistory = await this.getPriceHistory(portfolio.tokens)
      
      // Generate ML insights using OpenAI
      const insights = await this.generateMLInsights(portfolio, priceHistory, address, network)
      
      return insights
    } catch (error) {
      console.error("Error analyzing portfolio:", error)
      throw new Error("Failed to analyze portfolio")
    }
  }

  private async getPriceHistory(tokens: string[]): Promise<Record<string, any[]>> {
    // In a real implementation, you'd fetch historical price data from APIs like CoinGecko, CoinMarketCap, etc.
    const priceHistory: Record<string, any[]> = {}
    
    for (const token of tokens) {
      // Mock historical data - replace with real API calls
      priceHistory[token] = this.generateMockPriceHistory(token)
    }
    
    return priceHistory
  }

  private generateMockPriceHistory(token: string): any[] {
    const days = 30
    const history = []
    let basePrice = Math.random() * 1000 + 100 // Random base price between 100-1100
    
    for (let i = days; i >= 0; i--) {
      const volatility = 0.05 // 5% daily volatility
      const change = (Math.random() - 0.5) * 2 * volatility
      basePrice *= (1 + change)
      
      history.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        price: basePrice,
        volume: Math.random() * 1000000 + 100000,
        marketCap: basePrice * (Math.random() * 1000000 + 1000000)
      })
    }
    
    return history
  }

  private async generateMLInsights(
    portfolio: any, 
    priceHistory: Record<string, any[]>, 
    address: string, 
    network: string
  ): Promise<MLInsights> {
    // In a real implementation, you'd use OpenAI's API to analyze the data
    // For now, we'll generate mock insights based on the data
    
    const predictions: TokenPrediction[] = portfolio.tokens.map((token: string) => {
      const history = priceHistory[token] || []
      const currentPrice = history[history.length - 1]?.price || 100
      const trend = this.analyzeTrend(history)
      
      return {
        token,
        currentPrice,
        predictedPrice: currentPrice * (1 + (Math.random() - 0.5) * 0.2), // ±10% change
        confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
        timeframe: "30 days",
        factors: ["Technical indicators", "Market sentiment", "On-chain metrics"],
        trend: trend as "bullish" | "bearish" | "neutral"
      }
    })

    const rebalancing: PortfolioRebalancing = {
      currentAllocation: this.calculateCurrentAllocation(portfolio),
      recommendedAllocation: this.generateRecommendedAllocation(portfolio),
      reasoning: "Based on market analysis and risk assessment",
      confidence: 0.78,
      expectedReturn: 0.12 // 12% expected return
    }

    const riskAssessment: RiskAssessment = {
      riskScore: 0.3 + Math.random() * 0.4, // 30-70% risk
      riskLevel: this.calculateRiskLevel(portfolio),
      riskFactors: ["Market volatility", "Concentration risk", "Liquidity concerns"],
      recommendations: ["Diversify portfolio", "Add stablecoins", "Consider hedging"],
      volatilityIndex: 0.4 + Math.random() * 0.3
    }

    const marketTrend: MarketTrend = {
      trend: this.determineMarketTrend(priceHistory),
      strength: 0.6 + Math.random() * 0.3,
      indicators: ["RSI oversold", "MACD crossover", "Volume increase"],
      timeframe: "7 days",
      confidence: 0.81
    }

    const tradingTiming: TradingTiming = {
      recommendedAction: this.getRecommendedAction(portfolio, priceHistory),
      timeframe: "24-48 hours",
      reasoning: "Market consolidation phase ending",
      confidence: 0.73
    }

    return {
      predictions,
      rebalancing,
      riskAssessment,
      marketTrend,
      tradingTiming,
      metadata: {
        address,
        network,
        analysisDate: new Date().toISOString(),
        modelVersion: "1.0.0"
      }
    }
  }

  private analyzeTrend(history: any[]): string {
    if (history.length < 2) return "neutral"
    
    const recent = history.slice(-7) // Last 7 days
    const older = history.slice(-14, -7) // Previous 7 days
    
    const recentAvg = recent.reduce((sum, h) => sum + h.price, 0) / recent.length
    const olderAvg = older.reduce((sum, h) => sum + h.price, 0) / older.length
    
    const change = (recentAvg - olderAvg) / olderAvg
    
    if (change > 0.05) return "bullish"
    if (change < -0.05) return "bearish"
    return "neutral"
  }

  private calculateCurrentAllocation(portfolio: any): Record<string, number> {
    // Mock allocation calculation
    const tokens = portfolio.tokens || ["ETH", "USDC", "BTC", "Others"]
    const allocation: Record<string, number> = {}
    
    tokens.forEach((token: string, index: number) => {
      allocation[token] = 20 + (index * 10) + (Math.random() * 20)
    })
    
    // Normalize to 100%
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0)
    Object.keys(allocation).forEach(key => {
      allocation[key] = Math.round((allocation[key] / total) * 100)
    })
    
    return allocation
  }

  private generateRecommendedAllocation(portfolio: any): Record<string, number> {
    const current = this.calculateCurrentAllocation(portfolio)
    const recommended: Record<string, number> = {}
    
    Object.keys(current).forEach(token => {
      // Add some variation to current allocation
      const variation = (Math.random() - 0.5) * 20 // ±10%
      recommended[token] = Math.max(0, Math.min(100, current[token] + variation))
    })
    
    // Normalize to 100%
    const total = Object.values(recommended).reduce((sum, val) => sum + val, 0)
    Object.keys(recommended).forEach(key => {
      recommended[key] = Math.round((recommended[key] / total) * 100)
    })
    
    return recommended
  }

  private calculateRiskLevel(portfolio: any): "low" | "medium" | "high" {
    const riskScore = Math.random()
    
    if (riskScore < 0.33) return "low"
    if (riskScore < 0.66) return "medium"
    return "high"
  }

  private determineMarketTrend(priceHistory: Record<string, any[]>): "bullish" | "bearish" | "neutral" {
    const trends = Object.values(priceHistory).map(history => this.analyzeTrend(history))
    const bullishCount = trends.filter(t => t === "bullish").length
    const bearishCount = trends.filter(t => t === "bearish").length
    
    if (bullishCount > bearishCount) return "bullish"
    if (bearishCount > bullishCount) return "bearish"
    return "neutral"
  }

  private getRecommendedAction(portfolio: any, priceHistory: Record<string, any[]>): "buy" | "sell" | "hold" | "accumulate" {
    const marketTrend = this.determineMarketTrend(priceHistory)
    const riskLevel = this.calculateRiskLevel(portfolio)
    
    if (marketTrend === "bullish" && riskLevel !== "high") return "buy"
    if (marketTrend === "bearish") return "sell"
    if (marketTrend === "neutral" && riskLevel === "low") return "accumulate"
    return "hold"
  }

  // OpenAI integration for advanced analysis
  async generateAdvancedInsights(prompt: string, data: any): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error("OpenAI API key not configured")
    }

    try {
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
              content: "You are a crypto analytics expert. Analyze the provided data and give actionable insights."
            },
            {
              role: "user",
              content: `${prompt}\n\nData: ${JSON.stringify(data, null, 2)}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      const result = await response.json()
      return result.choices[0]?.message?.content || "Analysis unavailable"
    } catch (error) {
      console.error("OpenAI API error:", error)
      return "Analysis failed - using fallback insights"
    }
  }
}

export const mlService = new MLService() 