"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { getNoditClient, formatUSD } from "@/lib/nodit"
import { Search, Shield, AlertCircle, Clock, Wallet, Users } from "lucide-react"

export function WalletCreditScore() {
  const [address, setAddress] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const noditClient = getNoditClient()

  const {
    data: creditScore,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["creditScore", searchAddress],
    queryFn: async () => {
      if (!searchAddress) return null
      return await noditClient.calculateCreditScore("ethereum", searchAddress)
    },
    enabled: !!searchAddress,
    staleTime: 300000, // 5 minutes
  })

  const handleSearch = () => {
    if (address.trim()) {
      setSearchAddress(address.trim())
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-emerald-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getScoreBadge = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return <Badge className="bg-green-500">Excellent</Badge>
      case "Good":
        return <Badge className="bg-emerald-500">Good</Badge>
      case "Fair":
        return <Badge className="bg-yellow-500">Fair</Badge>
      case "Poor":
        return <Badge className="bg-orange-500">Poor</Badge>
      case "Very Poor":
        return <Badge className="bg-red-500">Very Poor</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Wallet Credit Score
        </CardTitle>
        <CardDescription>Analyze wallet reputation and activity metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={!address.trim() || isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Analyze Wallet
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to analyze wallet. Please check the address and try again.</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        )}

        {/* Credit Score Results */}
        {creditScore && (
          <>
            {/* Score Overview */}
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <h3 className="text-lg font-semibold mb-2">Wallet Reputation Score</h3>
              <div className="relative w-36 h-36 mb-4">
                <div className={`absolute inset-0 rounded-full ${getScoreColor(creditScore.score)} opacity-10`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{creditScore.score}</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-slate-200 dark:stroke-slate-700"
                    fill="none"
                    strokeWidth="3"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`stroke-current ${getScoreColor(creditScore.score)}`}
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${creditScore.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">Rating:</span>
                {getScoreBadge(creditScore.rating)}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on transaction history, token holdings, and network activity
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Account Age</h3>
                  </div>
                  <p className="text-2xl font-bold mb-1">{creditScore.metrics.accountAge} days</p>
                  <Progress value={Math.min(100, (creditScore.metrics.accountAge / 365) * 100)} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Portfolio Value</h3>
                  </div>
                  <p className="text-2xl font-bold mb-1">{formatUSD(creditScore.metrics.totalValue)}</p>
                  <Progress value={Math.min(100, (creditScore.metrics.totalValue / 10000) * 100)} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Network Size</h3>
                  </div>
                  <p className="text-2xl font-bold mb-1">{creditScore.metrics.uniqueInteractions} addresses</p>
                  <Progress
                    value={Math.min(100, (creditScore.metrics.uniqueInteractions / 50) * 100)}
                    className="h-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Activity Score</span>
                      <span className="text-sm font-medium">{creditScore.metrics.activityScore}/100</span>
                    </div>
                    <Progress value={creditScore.metrics.activityScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {creditScore.metrics.totalTransactions} transactions
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Portfolio Diversity</span>
                      <span className="text-sm font-medium">{creditScore.metrics.diversityScore}/100</span>
                    </div>
                    <Progress value={creditScore.metrics.diversityScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {creditScore.metrics.totalTokens} unique tokens
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Value Score</span>
                      <span className="text-sm font-medium">{creditScore.metrics.valueScore}/100</span>
                    </div>
                    <Progress value={creditScore.metrics.valueScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on total portfolio value of {formatUSD(creditScore.metrics.totalValue)}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Account Age</span>
                      <span className="text-sm font-medium">{creditScore.metrics.ageScore}/100</span>
                    </div>
                    <Progress value={creditScore.metrics.ageScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Account is {creditScore.metrics.accountAge} days old
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Network Score</span>
                      <span className="text-sm font-medium">{creditScore.metrics.networkScore}/100</span>
                    </div>
                    <Progress value={creditScore.metrics.networkScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Interacted with {creditScore.metrics.uniqueInteractions} unique addresses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!creditScore && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Credit Analysis</h3>
            <p className="text-muted-foreground max-w-md">
              Enter a wallet address above to analyze its reputation score based on transaction history, token holdings,
              and network activity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
