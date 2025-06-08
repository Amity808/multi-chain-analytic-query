"use client"

import type React from "react"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ValueTrendChart } from "@/components/charts/value-trend-chart"
import { TokenHoldingsTable } from "@/components/data/token-holdings-table"
import { getNoditClient, formatUSD } from "@/lib/nodit"
import { Search, Wallet, TrendingUp, AlertCircle } from "lucide-react"

interface PortfolioVisualizerProps {
  network: string
}

export function PortfolioVisualizer({ network }: PortfolioVisualizerProps) {
  const [address, setAddress] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const noditClient = getNoditClient()

  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio", network, searchAddress],
    queryFn: async () => {
      if (!searchAddress) return null

      const [tokens, transfers, balanceChanges] = await Promise.all([
        noditClient.getTokensOwned(network, searchAddress),
        noditClient.getTransfers(network, searchAddress),
        noditClient.getBalanceChanges(network, searchAddress),
      ])

      // Get prices for tokens
      const contractAddresses = tokens.map((token) => token.contract_address)
      const prices = contractAddresses.length > 0 ? await noditClient.getTokenPrices(network, contractAddresses) : []

      // Calculate portfolio value
      const tokensWithPrices = tokens.map((token) => {
        const price = prices.find((p) => p.contract_address === token.contract_address)
        const balance = Number.parseFloat(token.balance) / Math.pow(10, token.decimals)
        const value = price ? balance * price.price_usd : 0

        return {
          ...token,
          balance_formatted: balance,
          price_usd: price?.price_usd || 0,
          value_usd: value,
          price_change_24h: price?.price_change_24h || 0,
        }
      })

      const totalValue = tokensWithPrices.reduce((sum, token) => sum + token.value_usd, 0)

      return {
        tokens: tokensWithPrices,
        transfers,
        balanceChanges,
        totalValue,
        tokenCount: tokens.length,
      }
    },
    enabled: !!searchAddress,
    staleTime: 30000,
  })

  const handleSearch = () => {
    if (address.trim()) {
      setSearchAddress(address.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Enter wallet address (0x... or T...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
          />
        </div>
        <Button onClick={handleSearch} disabled={!address.trim() || isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Analyze Portfolio
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load portfolio data. Please check the address and try again.</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Portfolio Overview */}
      {portfolio && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUSD(portfolio.totalValue)}</div>
                <p className="text-xs text-muted-foreground">Across {portfolio.tokenCount} tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolio.tokenCount}</div>
                <p className="text-xs text-muted-foreground">With positive balances</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Badge variant="outline">{network.toUpperCase()}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{network}</div>
                <p className="text-xs text-muted-foreground">Current blockchain</p>
              </CardContent>
            </Card>
          </div>

          {/* Value Trend Chart */}
          {portfolio.balanceChanges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value Trend</CardTitle>
                <CardDescription>Historical balance changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ValueTrendChart data={portfolio.balanceChanges} />
              </CardContent>
            </Card>
          )}

          {/* Token Holdings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
              <CardDescription>Current token balances and values</CardDescription>
            </CardHeader>
            <CardContent>
              <TokenHoldingsTable tokens={portfolio.tokens} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!portfolio && !isLoading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolio Data</h3>
            <p className="text-muted-foreground text-center">
              Enter a wallet address above to analyze portfolio holdings and value trends
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
