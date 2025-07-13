"use client"

import { useState } from "react"
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
import { PredictionChart } from "@/components/ml/prediction-chart"
import { PortfolioRebalancing } from "@/components/ml/portfolio-rebalancing"
import { RiskAssessment } from "@/components/ml/risk-assessment"
import { MarketTrendAnalysis } from "@/components/ml/market-trend-analysis"
import { TradingTiming } from "@/components/ml/trading-timing"
import { aiAnalysisService } from "@/lib/ai-analysis-service"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Brain, 
  Target, 
  Clock, 
  Wallet, 
  BarChart3,
  Zap,
  Shield,
  Lightbulb,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const NETWORKS = [
  { id: "ethereum", name: "Ethereum", icon: "🔵" },
  { id: "bsc", name: "BSC", icon: "🟡" },
  { id: "tron", name: "Tron", icon: "🟢" },
  { id: "arbitrum", name: "Arbitrum", icon: "🔵" },
  { id: "polygon", name: "Polygon", icon: "🟣" },
  { id: "optimism", name: "Optimism", icon: "🔴" },
  { id: "avalanche", name: "Avalanche", icon: "🔴" },
  { id: "solana", name: "Solana", icon: "🟣" },
]

const PREDICTION_MODELS = [
  { id: "lstm", name: "LSTM Neural Network", description: "Advanced time series prediction" },
  { id: "transformer", name: "Transformer Model", description: "State-of-the-art attention-based model" },
  { id: "ensemble", name: "Ensemble Model", description: "Combines multiple models for accuracy" },
]

const RISK_LEVELS = {
  low: { label: "Low Risk", color: "bg-green-100 text-green-800", icon: Shield },
  medium: { label: "Medium Risk", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  high: { label: "High Risk", color: "bg-red-100 text-red-800", icon: AlertTriangle },
}

export default function MLInsightsPage() {
  const [address, setAddress] = useState("")
  const [network, setNetwork] = useState("ethereum")
  const [selectedModel, setSelectedModel] = useState("lstm")
  // const [isAnalyzing, setIsAnalyzing] = useState(false)

  // AI Analysis query
  const {
    data: mlInsights,
    isLoading: isAnalyzing,
    error: analysisError,
    refetch: analyzePortfolio,
  } = useQuery({
    queryKey: ["ai-analysis", address, network],
    queryFn: async () => {
      if (!address.trim()) return null
      return await aiAnalysisService.analyzePortfolio(address.trim(), network)
    },
    enabled: false, // Don't run automatically
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Form validation
  const isFormValid = address.trim() && network

  // Handle form submission
  const handleAnalyzePortfolio = () => {
    if (!isFormValid) return
    analyzePortfolio()
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "prediction": return TrendingUp
      case "rebalancing": return Target
      case "risk": return Shield
      case "trend": return BarChart3
      case "timing": return Clock
      default: return Brain
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              AI-Powered Crypto Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Advanced ML insights using real blockchain data from Nodit API
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis Configuration
                </CardTitle>
                <CardDescription>Configure your AI analysis parameters</CardDescription>
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
                  <p className="text-xs text-muted-foreground">Enter the wallet address to analyze</p>
                </div>

                {/* Network Selector */}
                <div className="space-y-2">
                  <Label>
                    Blockchain Network
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map((net) => (
                        <SelectItem key={net.id} value={net.id}>
                          <div className="flex items-center gap-2">
                            <span>{net.icon}</span>
                            {net.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ML Model Selection */}
                <div className="space-y-2">
                  <Label>
                    AI Model
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDICTION_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyzePortfolio}
                  disabled={!isFormValid || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isAnalyzing ? "AI Analyzing..." : "Generate AI Insights"}
                </Button>

                {/* Progress Indicator */}
                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI analyzing portfolio...</span>
                      <span>Processing</span>
                    </div>
                    <Progress value={undefined} className="w-full" />
                  </div>
                )}

                {/* Info Alert */}
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Our AI analyzes real blockchain data from Nodit API to provide actionable insights for your portfolio.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Error State */}
            {analysisError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Failed to analyze portfolio: {analysisError.message}</AlertDescription>
              </Alert>
            )}

            {/* AI Analysis Results */}
            {mlInsights && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                          <p className="text-2xl font-bold">{Math.round(mlInsights.predictions[0]?.confidence * 100 || 0)}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                          <p className="text-2xl font-bold">{Math.round(mlInsights.riskAssessment.riskScore * 100)}%</p>
                        </div>
                        <Shield className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Market Trend</p>
                          <p className="text-2xl font-bold capitalize">{mlInsights.marketTrend.trend}</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Trading Action</p>
                          <p className="text-2xl font-bold capitalize">{mlInsights.tradingTiming.recommendedAction}</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Analysis */}
                <Tabs defaultValue="predictions" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="predictions">Price Predictions</TabsTrigger>
                    <TabsTrigger value="rebalancing">Portfolio Rebalancing</TabsTrigger>
                    <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                    <TabsTrigger value="trend">Market Trends</TabsTrigger>
                    <TabsTrigger value="timing">Trading Timing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="predictions">
                    <PredictionChart predictions={mlInsights.predictions} />
                  </TabsContent>

                  <TabsContent value="rebalancing">
                    <PortfolioRebalancing
                      currentAllocation={mlInsights.rebalancing.currentAllocation}
                      recommendedAllocation={mlInsights.rebalancing.recommendedAllocation}
                      reasoning={mlInsights.rebalancing.reasoning}
                      confidence={mlInsights.rebalancing.confidence}
                      expectedReturn={mlInsights.rebalancing.expectedReturn}
                    />
                  </TabsContent>

                  <TabsContent value="risk">
                    <RiskAssessment
                      riskScore={mlInsights.riskAssessment.riskScore}
                      riskLevel={mlInsights.riskAssessment.riskLevel}
                      riskFactors={mlInsights.riskAssessment.riskFactors}
                      recommendations={mlInsights.riskAssessment.recommendations}
                      volatilityIndex={mlInsights.riskAssessment.volatilityIndex}
                    />
                  </TabsContent>

                  <TabsContent value="trend">
                    <MarketTrendAnalysis
                      trend={mlInsights.marketTrend.trend}
                      strength={mlInsights.marketTrend.strength}
                      indicators={mlInsights.marketTrend.indicators}
                      timeframe={mlInsights.marketTrend.timeframe}
                      confidence={mlInsights.marketTrend.confidence}
                    />
                  </TabsContent>

                  <TabsContent value="timing">
                    <TradingTiming
                      recommendedAction={mlInsights.tradingTiming.recommendedAction}
                      timeframe={mlInsights.tradingTiming.timeframe}
                      reasoning={mlInsights.tradingTiming.reasoning}
                      confidence={mlInsights.tradingTiming.confidence}
                      optimalPrice={mlInsights.tradingTiming.optimalPrice}
                    />
                  </TabsContent>
                </Tabs>

                {/* Analysis Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Address:</strong> {mlInsights.metadata.address}
                      </div>
                      <div>
                        <strong>Network:</strong> {mlInsights.metadata.network}
                      </div>
                      <div>
                        <strong>Analysis Date:</strong> {new Date(mlInsights.metadata.analysisDate).toLocaleString()}
                      </div>
                      <div>
                        <strong>AI Model:</strong> {mlInsights.metadata.modelVersion}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!mlInsights && !isAnalyzing && !analysisError && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI Analysis Generated</h3>
                  <p className="text-muted-foreground text-center">
                    Enter a wallet address and click "Generate AI Insights" to get AI-powered analysis using real blockchain data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 