"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getNoditClient, formatUSD } from "@/lib/nodit"
import { TrendingUp, TrendingDown, AlertCircle, Plus } from "lucide-react"

export function TokenPriceTracker() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [trackedTokens, setTrackedTokens] = useState<string[]>([
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  ])
  const noditClient = getNoditClient()

  const {
    data: tokenPrices,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tokenPrices", trackedTokens],
    queryFn: async () => {
      if (!trackedTokens.length) return []

      const prices = await noditClient.getTokenPrices("ethereum", trackedTokens)
      return prices
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  })

  const addToken = () => {
    if (tokenAddress && !trackedTokens.includes(tokenAddress)) {
      setTrackedTokens([...trackedTokens, tokenAddress])
      setTokenAddress("")
    }
  }

  const removeToken = (address: string) => {
    setTrackedTokens(trackedTokens.filter((token) => token !== address))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Token Price Tracker
        </CardTitle>
        <CardDescription>Track real-time prices of your favorite tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Token Form */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Enter token contract address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addToken()}
          />
          <Button onClick={addToken} disabled={!tokenAddress || isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Token
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load token prices. Please try again.</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Token Price List */}
        {tokenPrices && tokenPrices.length > 0 ? (
          <div className="space-y-3">
            {tokenPrices.map((token) => (
              <div key={token.contract_address} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{token.symbol || "Unknown Token"}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={() => removeToken(token.contract_address)}
                    >
                      ×
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono truncate">{token.contract_address}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatUSD(token.price_usd)}</div>
                  {token.price_change_24h !== 0 && (
                    <Badge
                      variant={token.price_change_24h > 0 ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {token.price_change_24h > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(token.price_change_24h).toFixed(2)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && <div className="text-center py-8 text-muted-foreground">No tokens added for tracking</div>
        )}

        {/* Refresh Button */}
        {tokenPrices && tokenPrices.length > 0 && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              Refresh Prices
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
