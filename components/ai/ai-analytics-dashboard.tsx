"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Clock,
    Target,
    BarChart3,
    Lightbulb,
    RefreshCw,
    Sparkles,
    Shield,
    DollarSign,
    Activity,
    Zap,
    Info,
    CheckCircle,
    XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// AI Analytics Types
interface AIAnalysis {
    id: string
    type: "price_prediction" | "portfolio_recommendation" | "risk_assessment" | "market_trend" | "trading_timing"
    title: string
    description: string
    confidence: number
    timestamp: string
    data: any
    recommendations?: string[]
    warnings?: string[]
}

interface PortfolioInsight {
    token: string
    currentValue: number
    predictedValue: number
    changePercent: number
    riskLevel: "low" | "medium" | "high"
    recommendation: "hold" | "buy" | "sell" | "dca"
}

interface MarketTrend {
    trend: "bullish" | "bearish" | "neutral"
    strength: number
    timeframe: string
    factors: string[]
    confidence: number
}

interface RiskAssessment {
    overallRisk: "low" | "medium" | "high"
    riskFactors: string[]
    recommendations: string[]
    score: number
}

interface TradingSignal {
    token: string
    signal: "buy" | "sell" | "hold"
    strength: number
    reasoning: string
    timeframe: string
}

// AI Analytics Engine
class AIAnalyticsEngine {
    private openaiApiKey: string

    constructor(openaiApiKey: string) {
        this.openaiApiKey = openaiApiKey
    }

    async generateAnalysis(
        address: string,
        chain: string,
        analysisType: string
    ): Promise<AIAnalysis> {
        try {
            console.log(`🤖 Generating ${analysisType} analysis for ${address} on ${chain}`)

            // Collect market data
            const marketData = await this.collectMarketData(address, chain)

            // Generate AI analysis
            const analysis = await this.generateAIInsight(analysisType, marketData)

            return {
                id: `${analysisType}-${Date.now()}`,
                type: analysisType as any,
                title: analysis.title,
                description: analysis.description,
                confidence: analysis.confidence,
                timestamp: new Date().toISOString(),
                data: analysis.data,
                recommendations: analysis.recommendations,
                warnings: analysis.warnings
            }
        } catch (error) {
            console.error(`❌ AI analysis failed for ${analysisType}:`, error)
            throw error
        }
    }

    private async collectMarketData(address: string, chain: string) {
        console.log("📊 Collecting market data...")

        try {
            // Get portfolio data using API routes
            const [tokensResponse, transfersResponse] = await Promise.all([
                fetch('/api/getTokensByAccount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountAddress: address, chain })
                }),
                fetch('/api/getTokenTransfersByAccount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountAddress: address, chain, limit: 100 })
                })
            ])

            const tokensData = await tokensResponse.json()
            const transfersData = await transfersResponse.json()

            const tokens = tokensData.items || []
            const transfers = transfersData.items || []

            console.log(`✅ Fetched ${tokens.length} tokens and ${transfers.length} transfers`)

            // Get price data for tokens
            const tokenAddresses = tokens.map((t: any) => t.contract_address).filter(Boolean)
            let prices = []

            if (tokenAddresses.length > 0) {
                try {
                    const pricesResponse = await fetch('/api/getTokenPrices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contractAddresses: tokenAddresses, chain })
                    })
                    const pricesData = await pricesResponse.json()
                    prices = pricesData.prices || []
                    console.log(`✅ Fetched prices for ${prices.length} tokens`)
                } catch (error) {
                    console.warn("⚠️ Failed to fetch prices:", error)
                }
            }

            return {
                portfolio: tokens,
                transactions: transfers,
                prices,
                address,
                chain,
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            console.error("❌ Failed to collect market data:", error)
            throw error
        }
    }

    private async generateAIInsight(analysisType: string, marketData: any): Promise<any> {
        console.log(`🧠 Generating AI insight for ${analysisType}...`)

        try {
            // Use our API endpoint instead of direct OpenAI calls
            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: marketData.address,
                    network: marketData.chain
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`AI Analysis API error: ${response.status} - ${errorData.error}`)
            }

            const insights = await response.json()
            console.log(`✅ Generated AI insights:`, insights)

            // Convert the ML insights to the format expected by the dashboard
            return this.convertMLInsightsToAnalysis(analysisType, insights)
        } catch (error) {
            console.error("❌ AI Analysis API error:", error)
            // Return fallback analysis
            return this.generateFallbackAnalysis(analysisType, marketData)
        }
    }

    private convertMLInsightsToAnalysis(analysisType: string, insights: any): any {
        console.log(`🔄 Converting ML insights to ${analysisType} analysis...`)

        const baseAnalysis = {
            title: `${analysisType.replace('_', ' ').toUpperCase()} Analysis`,
            description: "AI-powered analysis using real blockchain data",
            confidence: 0.85,
            timestamp: new Date().toISOString()
        }

        switch (analysisType) {
            case "price_prediction":
                return {
                    ...baseAnalysis,
                    data: {
                        predictions: insights.predictions || []
                    },
                    recommendations: insights.predictions?.slice(0, 5).map((p: any) =>
                        `${p.token}: Expected ${p.trend} trend with ${Math.round(p.confidence * 100)}% confidence`
                    ) || [],
                    warnings: insights.riskAssessment?.riskFactors || []
                }

            case "portfolio_recommendation":
                return {
                    ...baseAnalysis,
                    data: {
                        recommendations: Object.entries(insights.rebalancing?.recommendedAllocation || {}).map(([token, percentage]) => ({
                            token,
                            action: insights.tradingTiming?.recommendedAction || "hold",
                            reasoning: `Recommended allocation: ${percentage}%`,
                            confidence: insights.rebalancing?.confidence || 0.7
                        }))
                    },
                    recommendations: [
                        insights.rebalancing?.reasoning || "Portfolio analysis completed",
                        `Market trend: ${insights.marketTrend?.trend} (${Math.round(insights.marketTrend?.confidence * 100)}% confidence)`,
                        `Risk level: ${insights.riskAssessment?.riskLevel}`
                    ],
                    warnings: insights.riskAssessment?.riskFactors || []
                }

            case "risk_assessment":
                return {
                    ...baseAnalysis,
                    data: {
                        riskScore: insights.riskAssessment?.riskScore || 0.5,
                        riskLevel: insights.riskAssessment?.riskLevel || "medium",
                        factors: insights.riskAssessment?.riskFactors || []
                    },
                    recommendations: insights.riskAssessment?.recommendations || [],
                    warnings: insights.riskAssessment?.riskFactors || []
                }

            default:
                return {
                    ...baseAnalysis,
                    data: { insights },
                    recommendations: ["AI analysis completed successfully"],
                    warnings: []
                }
        }
    }

    private buildAnalysisPrompt(analysisType: string, marketData: any): string {
        const basePrompt = `
Analyze the following crypto portfolio and market data to provide ${analysisType} insights:

Portfolio Data:
${JSON.stringify(marketData.portfolio, null, 2)}

Transaction History:
${JSON.stringify(marketData.transactions.slice(0, 10), null, 2)}

Price Data:
${JSON.stringify(marketData.prices, null, 2)}

Address: ${marketData.address}
Chain: ${marketData.chain}

Please provide a JSON response with the following structure:
{
  "title": "Analysis title",
  "description": "Detailed description",
  "confidence": 0.85,
  "data": {
    // Analysis-specific data
  },
  "recommendations": ["rec1", "rec2"],
  "warnings": ["warning1", "warning2"]
}
`

        switch (analysisType) {
            case "price_prediction":
                return basePrompt + `
Focus on price predictions for the next 7-30 days based on:
- Historical price patterns
- Market sentiment
- Technical indicators
- Portfolio composition
Include specific price targets and confidence intervals.`

            case "portfolio_recommendation":
                return basePrompt + `
Provide portfolio optimization recommendations:
- Asset allocation suggestions
- Rebalancing opportunities
- Risk management strategies
- Diversification improvements
Include specific buy/sell recommendations with reasoning.`

            case "risk_assessment":
                return basePrompt + `
Assess portfolio risk factors:
- Concentration risk
- Volatility exposure
- Liquidity risk
- Market correlation
- Regulatory risks
Provide risk scores and mitigation strategies.`

            case "market_trend":
                return basePrompt + `
Analyze broader market trends:
- Sector performance
- Market sentiment
- Macroeconomic factors
- Technical indicators
- Correlation analysis
Provide trend direction and strength.`

            case "trading_timing":
                return basePrompt + `
Identify optimal trading opportunities:
- Entry/exit timing
- Market cycles
- Volatility patterns
- Momentum indicators
- Risk/reward ratios
Include specific timing recommendations.`

            default:
                return basePrompt
        }
    }

    private generateFallbackAnalysis(analysisType: string, marketData: any): any {
        console.log("🔄 Generating fallback analysis...")

        const baseAnalysis = {
            title: `${analysisType.replace('_', ' ').toUpperCase()} Analysis`,
            description: "AI analysis temporarily unavailable. Showing basic insights based on available data.",
            confidence: 0.5,
            data: {},
            recommendations: ["Consider consulting with a financial advisor", "Diversify your portfolio"],
            warnings: ["This is a fallback analysis - AI insights unavailable"]
        }

        switch (analysisType) {
            case "price_prediction":
                return {
                    ...baseAnalysis,
                    data: {
                        predictions: marketData.prices.map((p: any) => ({
                            token: p.contract_address,
                            currentPrice: p.price_usd,
                            predictedPrice: p.price_usd * (0.9 + Math.random() * 0.2),
                            confidence: 0.5
                        }))
                    }
                }

            case "portfolio_recommendation":
                return {
                    ...baseAnalysis,
                    data: {
                        recommendations: (marketData.portfolio || []).slice(0, 20).map((t: any) => ({
                            token: t.symbol || t.name || "Unknown",
                            action: "hold",
                            reasoning: "Insufficient data for AI recommendation"
                        }))
                    }
                }

            default:
                return baseAnalysis
        }
    }
}

// React Component
export function AIAnalyticsDashboard() {
    const [address, setAddress] = useState("")
    const [chain, setChain] = useState("ethereum")
    const [analysisType, setAnalysisType] = useState("portfolio_recommendation")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analyses, setAnalyses] = useState<AIAnalysis[]>([])
    const [progress, setProgress] = useState(0)

    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""

    const analyticsEngine = new AIAnalyticsEngine(openaiApiKey)

    const analysisTypes = [
        { value: "price_prediction", label: "Price Prediction", icon: TrendingUp },
        { value: "portfolio_recommendation", label: "Portfolio Recommendations", icon: Target },
        { value: "risk_assessment", label: "Risk Assessment", icon: Shield },
        { value: "market_trend", label: "Market Trends", icon: BarChart3 },
        { value: "trading_timing", label: "Trading Timing", icon: Clock }
    ]

    const chains = [
        { value: "ethereum", label: "Ethereum" },
        { value: "bsc", label: "BSC" },
        { value: "polygon", label: "Polygon" },
        { value: "arbitrum", label: "Arbitrum" },
        { value: "optimism", label: "Optimism" }
    ]

    const generateAnalysis = async () => {
        if (!address.trim()) return

        setIsAnalyzing(true)
        setProgress(0)

        try {
            // Simulate progress
            setProgress(20)
            await new Promise(resolve => setTimeout(resolve, 500))

            setProgress(40)
            const analysis = await analyticsEngine.generateAnalysis(address, chain, analysisType)

            setProgress(80)
            await new Promise(resolve => setTimeout(resolve, 300))

            setProgress(100)
            setAnalyses(prev => [analysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
        } catch (error) {
            console.error("Analysis failed:", error)
        } finally {
            setIsAnalyzing(false)
            setProgress(0)
        }
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return "text-green-600"
        if (confidence >= 0.6) return "text-yellow-600"
        return "text-red-600"
    }

    const getConfidenceBadge = (confidence: number) => {
        if (confidence >= 0.8) return "default"
        if (confidence >= 0.6) return "secondary"
        return "destructive"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                            <Brain className="h-10 w-10 text-blue-600" />
                            AI Crypto Analytics
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            AI-powered insights for your crypto portfolio using advanced analytics
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Badge variant="outline" className="text-sm">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Powered by GPT-4
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    AI Analysis Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure your AI analysis parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Address Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">
                                        Wallet Address
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="address"
                                        placeholder="0x... or T..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="font-mono"
                                    />
                                </div>

                                {/* Chain Selector */}
                                <div className="space-y-2">
                                    <Label>Blockchain Network</Label>
                                    <Select value={chain} onValueChange={setChain}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {chains.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Analysis Type */}
                                <div className="space-y-2">
                                    <Label>Analysis Type</Label>
                                    <Select value={analysisType} onValueChange={setAnalysisType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {analysisTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        <type.icon className="h-4 w-4" />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Generate Button */}
                                <Button
                                    onClick={generateAnalysis}
                                    disabled={!address.trim() || isAnalyzing}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Brain className="h-4 w-4 mr-2" />
                                    {isAnalyzing ? "Analyzing..." : "Generate AI Analysis"}
                                </Button>

                                {/* Progress */}
                                {isAnalyzing && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>AI Analysis in progress...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="w-full" />
                                    </div>
                                )}

                                {/* Info Alert */}
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        AI analysis uses GPT-4 to analyze your portfolio data and provide
                                        personalized insights. Analysis quality depends on available data.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2">
                        {analyses.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No AI Analysis Generated</h3>
                                    <p className="text-muted-foreground text-center">
                                        Enter a wallet address and select an analysis type to generate AI-powered insights
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {analyses.map((analysis, index) => (
                                    <Card key={analysis.id} className="relative">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {(() => {
                                                            const type = analysisTypes.find(t => t.value === analysis.type)
                                                            return type?.icon ? <type.icon className="h-5 w-5" /> : null
                                                        })()}
                                                        {analysis.title}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {analysis.description}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getConfidenceBadge(analysis.confidence)}>
                                                        {Math.round(analysis.confidence * 100)}% Confidence
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(analysis.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Tabs defaultValue="insights" className="w-full">
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger value="insights">Insights</TabsTrigger>
                                                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                                                    <TabsTrigger value="warnings">Warnings</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="insights" className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {analysis.data && Object.entries(analysis.data).map(([key, value]) => (
                                                            <div key={key} className="p-4 border rounded-lg">
                                                                <h4 className="font-semibold mb-2 capitalize">
                                                                    {key.replace(/_/g, ' ')}
                                                                </h4>
                                                                <pre className="text-sm text-muted-foreground overflow-auto">
                                                                    {JSON.stringify(value, null, 2)}
                                                                </pre>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="recommendations" className="space-y-4">
                                                    {analysis.recommendations && analysis.recommendations.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {analysis.recommendations.map((rec, idx) => (
                                                                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                                    <span className="text-sm">{rec}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-center py-4">
                                                            No specific recommendations available
                                                        </p>
                                                    )}
                                                </TabsContent>

                                                <TabsContent value="warnings" className="space-y-4">
                                                    {analysis.warnings && analysis.warnings.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {analysis.warnings.map((warning, idx) => (
                                                                <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                                                    <span className="text-sm">{warning}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-center py-4">
                                                            No warnings to display
                                                        </p>
                                                    )}
                                                </TabsContent>
                                            </Tabs>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 