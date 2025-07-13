"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PortfolioRebalancingProps {
  currentAllocation: Record<string, number>
  recommendedAllocation: Record<string, number>
  reasoning: string
  confidence: number
  expectedReturn: number
}

export function PortfolioRebalancing({
  currentAllocation,
  recommendedAllocation,
  reasoning,
  confidence,
  expectedReturn
}: PortfolioRebalancingProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const calculateChange = (current: number, recommended: number) => {
    return recommended - current
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return TrendingUp
    if (change < 0) return AlertTriangle
    return CheckCircle
  }

  const tokens = Object.keys(currentAllocation)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{Math.round(confidence * 100)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Return</p>
                <p className="text-2xl font-bold text-green-600">+{Math.round(expectedReturn * 100)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-bold text-yellow-600">Medium</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Portfolio Rebalancing Recommendations
          </CardTitle>
          <CardDescription>
            AI-optimized allocation based on market conditions and risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reasoning */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">AI Reasoning</h4>
            <p className="text-sm text-muted-foreground">{reasoning}</p>
          </div>

          {/* Allocation Chart */}
          <div className="space-y-4">
            <h4 className="font-medium">Allocation Changes</h4>
            <div className="space-y-3">
              {tokens.map((token) => {
                const current = currentAllocation[token]
                const recommended = recommendedAllocation[token]
                const change = calculateChange(current, recommended)
                const ChangeIcon = getChangeIcon(change)

                return (
                  <div key={token} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{token}</span>
                        </div>
                        <span className="font-medium">{token}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {current}% → {recommended}%
                        </span>
                        <ChangeIcon className={cn("h-4 w-4", getChangeColor(change))} />
                        <Badge 
                          variant={change > 0 ? "default" : change < 0 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {change > 0 ? "+" : ""}{change}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Current</span>
                          <span>{current}%</span>
                        </div>
                        <Progress value={current} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Recommended</span>
                          <span>{recommended}%</span>
                        </div>
                        <Progress 
                          value={recommended} 
                          className={cn("h-2", change > 0 ? "bg-green-100" : change < 0 ? "bg-red-100" : "")}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <h4 className="font-medium">Recommended Actions</h4>
            <div className="space-y-2">
              {tokens.map((token) => {
                const change = calculateChange(currentAllocation[token], recommendedAllocation[token])
                
                if (Math.abs(change) < 5) return null // Skip small changes
                
                return (
                  <div key={token} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {change > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{token}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {change > 0 ? "Increase" : "Decrease"} allocation
                      </span>
                      <Badge variant={change > 0 ? "default" : "destructive"}>
                        {Math.abs(change)}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Implementation Steps */}
          <div className="space-y-3">
            <h4 className="font-medium">Implementation Strategy</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="text-sm">Prioritize high-impact changes first</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-sm">Execute during low volatility periods</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-sm">Monitor performance for 30 days</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1">
              <Target className="h-4 w-4 mr-2" />
              Apply Recommendations
            </Button>
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              View Detailed Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 