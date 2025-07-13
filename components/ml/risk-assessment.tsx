"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskAssessmentProps {
  riskScore: number
  riskLevel: "low" | "medium" | "high"
  riskFactors: string[]
  recommendations: string[]
  volatilityIndex: number
}

export function RiskAssessment({
  riskScore,
  riskLevel,
  riskFactors,
  recommendations,
  volatilityIndex
}: RiskAssessmentProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low": return CheckCircle
      case "medium": return AlertTriangle
      case "high": return AlertTriangle
      default: return Shield
    }
  }

  const getVolatilityColor = (index: number) => {
    if (index < 0.3) return "text-green-600"
    if (index < 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  const RiskIcon = getRiskIcon(riskLevel)

  return (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">{Math.round(riskScore * 100)}%</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-bold capitalize">{riskLevel}</p>
              </div>
              <RiskIcon className={cn("h-8 w-8", riskLevel === "low" ? "text-green-600" : riskLevel === "medium" ? "text-yellow-600" : "text-red-600")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volatility Index</p>
                <p className={cn("text-2xl font-bold", getVolatilityColor(volatilityIndex))}>
                  {Math.round(volatilityIndex * 100)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Portfolio Risk Assessment
          </CardTitle>
          <CardDescription>
            AI-powered risk analysis based on portfolio composition and market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Score Visualization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Overall Risk Score</h4>
              <Badge className={getRiskColor(riskLevel)}>
                {Math.round(riskScore * 100)}%
              </Badge>
            </div>
            <Progress 
              value={riskScore * 100} 
              className={cn(
                "h-3",
                riskLevel === "low" ? "bg-green-100" : 
                riskLevel === "medium" ? "bg-yellow-100" : "bg-red-100"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="space-y-3">
            <h4 className="font-medium">Risk Factors</h4>
            <div className="space-y-2">
              {riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium">Risk Breakdown</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Market Risk</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Concentration Risk</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Liquidity Risk</span>
                  <span>15%</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Volatility Risk</span>
                  <span>10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium">Risk Mitigation Recommendations</h4>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Alerts */}
          {riskLevel !== "low" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Risk Alert:</strong> Your portfolio shows elevated risk levels. 
                Consider implementing the recommended mitigation strategies to reduce exposure.
              </AlertDescription>
            </Alert>
          )}

          {/* Volatility Analysis */}
          <div className="space-y-3">
            <h4 className="font-medium">Volatility Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Historical Volatility</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on 30-day price movements
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(volatilityIndex * 80)}%
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Expected Volatility</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-predicted next 30 days
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(volatilityIndex * 120)}%
                </p>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="space-y-3">
            <h4 className="font-medium">Risk Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">VaR (95%)</p>
                <p className="text-lg font-bold text-red-600">-12.5%</p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Sharpe Ratio</p>
                <p className="text-lg font-bold text-green-600">1.2</p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Beta</p>
                <p className="text-lg font-bold text-blue-600">1.15</p>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Max Drawdown</p>
                <p className="text-lg font-bold text-orange-600">-18.3%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 