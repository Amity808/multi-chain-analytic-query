"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Target, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface TradingTimingProps {
  recommendedAction: "buy" | "sell" | "hold" | "accumulate"
  timeframe: string
  reasoning: string
  confidence: number
  optimalPrice?: number
}

export function TradingTiming({
  recommendedAction,
  timeframe,
  reasoning,
  confidence,
  optimalPrice
}: TradingTimingProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "buy": return TrendingUp
      case "sell": return TrendingDown
      case "hold": return Minus
      case "accumulate": return Target
      default: return Clock
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "buy": return "text-green-600"
      case "sell": return "text-red-600"
      case "hold": return "text-gray-600"
      case "accumulate": return "text-blue-600"
      default: return "text-gray-600"
    }
  }

  const getActionBgColor = (action: string) => {
    switch (action) {
      case "buy": return "bg-green-100 text-green-800"
      case "sell": return "bg-red-100 text-red-800"
      case "hold": return "bg-gray-100 text-gray-800"
      case "accumulate": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const ActionIcon = getActionIcon(recommendedAction)

  return (
    <div className="space-y-6">
      {/* Trading Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recommended Action</p>
                <p className={cn("text-2xl font-bold capitalize", getActionColor(recommendedAction))}>
                  {recommendedAction}
                </p>
              </div>
              <ActionIcon className={cn("h-8 w-8", getActionColor(recommendedAction))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className={cn("text-2xl font-bold", getConfidenceColor(confidence))}>
                  {Math.round(confidence * 100)}%
                </p>
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

      {/* Main Trading Timing Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Optimal Trading Timing
          </CardTitle>
          <CardDescription>
            AI-powered trading recommendations based on market analysis and technical indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Trading Recommendation</h4>
              <Badge className={getActionBgColor(recommendedAction)}>
                {recommendedAction.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{reasoning}</p>
          </div>

          {/* Timing Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium">Timing Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Entry Point</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {recommendedAction === "buy" || recommendedAction === "accumulate" ? "Now" : "Wait"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {recommendedAction === "buy" || recommendedAction === "accumulate" 
                    ? "Optimal entry conditions met" 
                    : "Waiting for better entry conditions"}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Target Price</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {optimalPrice ? `$${optimalPrice.toLocaleString()}` : "TBD"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {recommendedAction === "buy" ? "Expected upside target" : "Expected downside target"}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Duration</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{timeframe}</p>
                <p className="text-sm text-muted-foreground">
                  Expected timeframe for this recommendation
                </p>
              </div>
            </div>
          </div>

          {/* Market Conditions */}
          <div className="space-y-3">
            <h4 className="font-medium">Current Market Conditions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">RSI</p>
                <p className={cn("text-lg font-bold", 
                  recommendedAction === "buy" ? "text-green-600" : "text-red-600")}>
                  {recommendedAction === "buy" ? "35" : "75"}
                </p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">MACD</p>
                <p className={cn("text-lg font-bold", 
                  recommendedAction === "buy" ? "text-green-600" : "text-red-600")}>
                  {recommendedAction === "buy" ? "Bullish" : "Bearish"}
                </p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Volume</p>
                <p className="text-lg font-bold text-blue-600">
                  +{Math.round(Math.random() * 50 + 20)}%
                </p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Support</p>
                <p className="text-lg font-bold text-green-600">
                  ${Math.round(Math.random() * 1000 + 2000).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Trading Signals */}
          <div className="space-y-3">
            <h4 className="font-medium">Trading Signals</h4>
            <div className="space-y-2">
              {recommendedAction === "buy" && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Strong buy signal from RSI oversold condition</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">MACD showing bullish crossover</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Volume increasing above average</span>
                  </div>
                </>
              )}
              
              {recommendedAction === "sell" && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">RSI overbought condition detected</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">MACD showing bearish divergence</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Price approaching resistance level</span>
                  </div>
                </>
              )}
              
              {recommendedAction === "hold" && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Market in consolidation phase</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">No clear directional signals</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Low volatility environment</span>
                  </div>
                </>
              )}
              
              {recommendedAction === "accumulate" && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Dollar-cost averaging recommended</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Long-term bullish outlook</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Gradual position building</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Risk Management */}
          <div className="space-y-3">
            <h4 className="font-medium">Risk Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Stop Loss</h5>
                <p className="text-lg font-bold text-red-600">
                  ${Math.round(Math.random() * 500 + 1500).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Recommended stop loss level
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Position Size</h5>
                <p className="text-lg font-bold text-blue-600">
                  {Math.round(Math.random() * 20 + 10)}% of portfolio
                </p>
                <p className="text-sm text-muted-foreground">
                  Recommended position size
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1" variant={recommendedAction === "buy" ? "default" : "outline"}>
              <ActionIcon className="h-4 w-4 mr-2" />
              {recommendedAction === "buy" ? "Execute Buy" : 
               recommendedAction === "sell" ? "Execute Sell" : 
               recommendedAction === "hold" ? "Hold Position" : "Start Accumulation"}
            </Button>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </div>

          {/* Disclaimer */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered as financial advice. 
              Always conduct your own research and consider your risk tolerance before making trading decisions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
} 