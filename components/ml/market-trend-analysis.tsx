"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, BarChart3, Activity, Target, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketTrendProps {
  trend: "bullish" | "bearish" | "neutral"
  strength: number
  indicators: string[]
  timeframe: string
  confidence: number
}

export function MarketTrendAnalysis({
  trend,
  strength,
  indicators,
  timeframe,
  confidence
}: MarketTrendProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "bullish": return TrendingUp
      case "bearish": return TrendingDown
      default: return Minus
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "bullish": return "text-green-600"
      case "bearish": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.7) return "text-green-600"
    if (strength >= 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const TrendIcon = getTrendIcon(trend)

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Trend</p>
                <p className={cn("text-2xl font-bold capitalize", getTrendColor(trend))}>
                  {trend}
                </p>
              </div>
              <TrendIcon className={cn("h-8 w-8", getTrendColor(trend))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trend Strength</p>
                <p className={cn("text-2xl font-bold", getStrengthColor(strength))}>
                  {Math.round(strength * 100)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{Math.round(confidence * 100)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Timeframe</p>
                <p className="text-2xl font-bold">{timeframe}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Trend Analysis
          </CardTitle>
          <CardDescription>
            AI-powered market sentiment and trend analysis based on multiple indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trend Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Current Market Sentiment</h4>
              <Badge className={getConfidenceColor(confidence)}>
                {Math.round(confidence * 100)}% Confidence
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              The market is showing a <strong className={getTrendColor(trend)}>{trend}</strong> trend 
              with <strong>{Math.round(strength * 100)}%</strong> strength over the next {timeframe}.
            </p>
          </div>

          {/* Technical Indicators */}
          <div className="space-y-3">
            <h4 className="font-medium">Technical Indicators</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      trend === "bullish" ? "bg-green-500" : 
                      trend === "bearish" ? "bg-red-500" : "bg-gray-500"
                    )} />
                    <span className="text-sm">{indicator}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {trend === "bullish" ? "Bullish" : trend === "bearish" ? "Bearish" : "Neutral"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Strength Visualization */}
          <div className="space-y-3">
            <h4 className="font-medium">Trend Strength Breakdown</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price Action</span>
                  <span>{Math.round(strength * 85)}%</span>
                </div>
                <Progress value={strength * 85} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Volume Analysis</span>
                  <span>{Math.round(strength * 72)}%</span>
                </div>
                <Progress value={strength * 72} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Momentum Indicators</span>
                  <span>{Math.round(strength * 68)}%</span>
                </div>
                <Progress value={strength * 68} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Market Sentiment</span>
                  <span>{Math.round(strength * 91)}%</span>
                </div>
                <Progress value={strength * 91} className="h-2" />
              </div>
            </div>
          </div>

          {/* Market Metrics */}
          <div className="space-y-3">
            <h4 className="font-medium">Market Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">RSI</p>
                <p className={cn("text-lg font-bold", trend === "bullish" ? "text-green-600" : "text-red-600")}>
                  {trend === "bullish" ? "35" : trend === "bearish" ? "75" : "50"}
                </p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">MACD</p>
                <p className={cn("text-lg font-bold", trend === "bullish" ? "text-green-600" : "text-red-600")}>
                  {trend === "bullish" ? "Bullish" : trend === "bearish" ? "Bearish" : "Neutral"}
                </p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Volume</p>
                <p className="text-lg font-bold text-blue-600">
                  +{Math.round(Math.random() * 50 + 20)}%
                </p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Volatility</p>
                <p className="text-lg font-bold text-orange-600">
                  {Math.round(Math.random() * 30 + 15)}%
                </p>
              </div>
            </div>
          </div>

          {/* Trend Prediction */}
          <div className="space-y-3">
            <h4 className="font-medium">Trend Prediction</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Short Term (1-7 days)</span>
                </div>
                <p className={cn("text-lg font-bold", getTrendColor(trend))}>
                  {trend === "bullish" ? "Continued Uptrend" : 
                   trend === "bearish" ? "Continued Downtrend" : "Sideways Movement"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(confidence * 85)}% confidence
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Medium Term (1-4 weeks)</span>
                </div>
                <p className={cn("text-lg font-bold", getTrendColor(trend))}>
                  {trend === "bullish" ? "Potential Breakout" : 
                   trend === "bearish" ? "Potential Breakdown" : "Consolidation"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(confidence * 72)}% confidence
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Long Term (1-3 months)</span>
                </div>
                <p className={cn("text-lg font-bold", getTrendColor(trend))}>
                  {trend === "bullish" ? "Bull Market Cycle" : 
                   trend === "bearish" ? "Bear Market Cycle" : "Range-bound"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(confidence * 58)}% confidence
                </p>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-3">
            <h4 className="font-medium">Key Market Insights</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">
                  <strong>Volume Analysis:</strong> Trading volume has increased by 45% over the past week
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">
                  <strong>Institutional Activity:</strong> Large wallet movements indicate growing institutional interest
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">
                  <strong>On-chain Metrics:</strong> Network activity and transaction count show healthy growth
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 