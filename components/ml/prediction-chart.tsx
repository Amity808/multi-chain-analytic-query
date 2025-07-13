"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, Target, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TokenPrediction {
    token: string
    currentPrice: number
    predictedPrice: number
    confidence: number
    timeframe: string
    factors: string[]
    trend: "bullish" | "bearish" | "neutral"
}

interface PredictionChartProps {
    predictions: TokenPrediction[]
}

export function PredictionChart({ predictions }: PredictionChartProps) {
    const [selectedToken, setSelectedToken] = useState<string>("")
    const [timeframe, setTimeframe] = useState<string>("30d")

    useEffect(() => {
        if (predictions.length > 0 && !selectedToken) {
            setSelectedToken(predictions[0].token)
        }
    }, [predictions, selectedToken])

    const selectedPrediction = predictions.find(p => p.token === selectedToken)

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

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return "bg-green-100 text-green-800"
        if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800"
        return "bg-red-100 text-red-800"
    }

    const calculatePriceChange = (current: number, predicted: number) => {
        return ((predicted - current) / current) * 100
    }

    if (!selectedPrediction) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No predictions available</p>
                </CardContent>
            </Card>
        )
    }

    const priceChange = calculatePriceChange(selectedPrediction.currentPrice, selectedPrediction.predictedPrice)
    const TrendIcon = getTrendIcon(selectedPrediction.trend)

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Select Token</label>
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {predictions.map((prediction) => (
                                <SelectItem key={prediction.token} value={prediction.token}>
                                    {prediction.token}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Timeframe</label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                            <SelectItem value="90d">90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main Prediction Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            <CardTitle>{selectedPrediction.token} Price Prediction</CardTitle>
                        </div>
                        <Badge className={getConfidenceColor(selectedPrediction.confidence)}>
                            {Math.round(selectedPrediction.confidence * 100)}% Confidence
                        </Badge>
                    </div>
                    <CardDescription>
                        AI-powered price prediction for {selectedPrediction.timeframe}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Price Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Current Price</p>
                            <p className="text-2xl font-bold">${selectedPrediction.currentPrice.toLocaleString()}</p>
                        </div>

                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Predicted Price</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${selectedPrediction.predictedPrice.toLocaleString()}
                            </p>
                        </div>

                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Expected Change</p>
                            <div className="flex items-center justify-center gap-1">
                                <TrendIcon className={cn("h-5 w-5", getTrendColor(selectedPrediction.trend))} />
                                <p className={cn("text-xl font-bold", getTrendColor(selectedPrediction.trend))}>
                                    {priceChange > 0 ? "+" : ""}{priceChange.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Trend Analysis */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <h4 className="font-medium">Trend Analysis</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("capitalize", getTrendColor(selectedPrediction.trend))}>
                                {selectedPrediction.trend}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Based on technical indicators and market sentiment
                            </span>
                        </div>
                    </div>

                    {/* Key Factors */}
                    <div className="space-y-3">
                        <h4 className="font-medium">Key Factors</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedPrediction.factors.map((factor, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {factor}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Confidence Breakdown */}
                    <div className="space-y-3">
                        <h4 className="font-medium">Confidence Breakdown</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Technical Analysis</span>
                                <span>85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span>Market Sentiment</span>
                                <span>72%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span>On-chain Metrics</span>
                                <span>68%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "68%" }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* All Predictions Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>All Token Predictions</CardTitle>
                    <CardDescription>Overview of all predicted price movements</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {predictions.map((prediction) => {
                            const change = calculatePriceChange(prediction.currentPrice, prediction.predictedPrice)
                            const PredictionIcon = getTrendIcon(prediction.trend)

                            return (
                                <div key={prediction.token} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium">{prediction.token}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{prediction.token}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ${prediction.currentPrice.toLocaleString()} → ${prediction.predictedPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <PredictionIcon className={cn("h-4 w-4", getTrendColor(prediction.trend))} />
                                        <span className={cn("font-medium", getTrendColor(prediction.trend))}>
                                            {change > 0 ? "+" : ""}{change.toFixed(1)}%
                                        </span>
                                        <Badge className={getConfidenceColor(prediction.confidence)}>
                                            {Math.round(prediction.confidence * 100)}%
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 