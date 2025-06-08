"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getNoditClient, formatUSD, formatBalance } from "@/lib/nodit"
import { Search, BarChart3, TrendingUp, Wallet, AlertCircle } from "lucide-react"

const SUPPORTED_CHAINS = [
  { id: "ethereum", name: "Ethereum", color: "bg-blue-500" },
  { id: "bsc", name: "BSC", color: "bg-yellow-500" },
  { id: "tron", name: "Tron", color: "bg-red-500" },
]

export function MultiChainDashboard() {
  const [address, setAddress] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const noditClient = getNoditClient()

  const {
    data: multiChainData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["multichain", searchAddress],
    queryFn: async () => {
      if (!searchAddress) return null

      const chainPromises = SUPPORTED_CHAINS.map(async (chain) => {
        try {
          const [tokens, transfers] = await Promise.all([
            noditClient.getTokensOwned(chain.id, searchAddress),
            noditClient.getTransfers(chain.id, searchAddress, 20),
          ])

          // Get prices for tokens if available
          const contractAddresses = tokens.map((token) => token.contract_address)
          let prices: any[] = []

          if (contractAddresses.length > 0) {
            try {
              prices = await noditClient.getTokenPrices(chain.id, contractAddresses)
            } catch (e) {
              console.warn(`Price data not available for ${chain.name}`)
            }
          }

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
            }
          })

          const totalValue = tokensWithPrices.reduce((sum, token) => sum + token.value_usd, 0)

          return {
            chain,
            tokens: tokensWithPrices,
            transfers,
            totalValue,
            tokenCount: tokens.length,
            transferCount: transfers.length,
            hasActivity: tokens.length > 0 || transfers.length > 0,
          }
        } catch (error) {
          console.error(`Error fetching data for ${chain.name}:`, error)
          return {
            chain,
            tokens: [],
            transfers: [],
            totalValue: 0,
            tokenCount: 0,
            transferCount: 0,
            hasActivity: false,
            error: error.message,
          }
        }
      })

      const results = await Promise.all(chainPromises)

      const totalPortfolioValue = results.reduce((sum, result) => sum + result.totalValue, 0)
      const totalTokens = results.reduce((sum, result) => sum + result.tokenCount, 0)
      const activeChains = results.filter((result) => result.hasActivity).length

      return {
        chains: results,
        summary: {
          totalPortfolioValue,
          totalTokens,
          activeChains,
          totalChains: SUPPORTED_CHAINS.length,
        },
      }
    },
    enabled: !!searchAddress,
    staleTime: 60000,
  })

  const handleSearch = () => {
    if (address.trim()) {
      setSearchAddress(address.trim())
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Enter wallet address to compare across chains"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={!address.trim() || isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Compare Chains
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load multi-chain data. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Multi-Chain Results */}
      {multiChainData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUSD(multiChainData.summary.totalPortfolioValue)}</div>
                <p className="text-xs text-muted-foreground">Across all chains</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{multiChainData.summary.totalTokens}</div>
                <p className="text-xs text-muted-foreground">Unique token holdings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chains</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {multiChainData.summary.activeChains}/{multiChainData.summary.totalChains}
                </div>
                <p className="text-xs text-muted-foreground">With activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Chain</CardTitle>
                <Badge variant="outline">
                  {multiChainData.chains.filter((c) => c.hasActivity).sort((a, b) => b.totalValue - a.totalValue)[0]
                    ?.chain.name || "None"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatUSD(Math.max(...multiChainData.chains.map((c) => c.totalValue)))}
                </div>
                <p className="text-xs text-muted-foreground">Highest value</p>
              </CardContent>
            </Card>
          </div>

          {/* Chain Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Chain Comparison</CardTitle>
              <CardDescription>Portfolio breakdown across different blockchain networks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {multiChainData.chains.map((chainData) => (
                  <Card key={chainData.chain.id} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${chainData.chain.color}`} />
                        {chainData.chain.name}
                        {chainData.error && (
                          <Badge variant="destructive" className="text-xs">
                            Error
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {chainData.error ? (
                        <div className="text-sm text-muted-foreground">Failed to load data</div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Portfolio Value</span>
                            <span className="font-semibold">{formatUSD(chainData.totalValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tokens</span>
                            <span className="font-semibold">{chainData.tokenCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Transfers</span>
                            <span className="font-semibold">{chainData.transferCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant={chainData.hasActivity ? "default" : "secondary"}>
                              {chainData.hasActivity ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Chain Data */}
          <Tabs defaultValue={multiChainData.chains.find((c) => c.hasActivity)?.chain.id || "ethereum"}>
            <TabsList className="grid w-full grid-cols-3">
              {multiChainData.chains.map((chainData) => (
                <TabsTrigger key={chainData.chain.id} value={chainData.chain.id}>
                  <div className={`w-2 h-2 rounded-full ${chainData.chain.color} mr-2`} />
                  {chainData.chain.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {multiChainData.chains.map((chainData) => (
              <TabsContent key={chainData.chain.id} value={chainData.chain.id} className="space-y-6">
                {chainData.error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load data for {chainData.chain.name}: {chainData.error}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Token Holdings */}
                    {chainData.tokens.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Token Holdings on {chainData.chain.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {chainData.tokens.map((token) => (
                              <div
                                key={token.contract_address}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold">
                                    {token.name} ({token.symbol})
                                  </p>
                                  <p className="text-sm text-muted-foreground font-mono truncate">
                                    {token.contract_address}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    {token.balance_formatted.toLocaleString(undefined, {
                                      maximumFractionDigits: 6,
                                    })}
                                  </p>
                                  {token.value_usd > 0 && (
                                    <p className="text-sm text-muted-foreground">{formatUSD(token.value_usd)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Transfers */}
                    {chainData.transfers.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Transfers on {chainData.chain.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {chainData.transfers.slice(0, 10).map((transfer) => (
                              <div
                                key={transfer.transaction_hash}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold">{transfer.token_symbol}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transfer.timestamp).toLocaleString()}
                                  </p>
                                  <p className="text-xs font-mono truncate">{transfer.transaction_hash}</p>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    variant={
                                      transfer.from_address.toLowerCase() === searchAddress.toLowerCase()
                                        ? "destructive"
                                        : "default"
                                    }
                                  >
                                    {transfer.from_address.toLowerCase() === searchAddress.toLowerCase() ? "OUT" : "IN"}
                                  </Badge>
                                  <p className="text-sm font-mono mt-1">{formatBalance(transfer.value, 18)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* No Activity State */}
                    {!chainData.hasActivity && (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <div className={`w-12 h-12 rounded-full ${chainData.chain.color} opacity-20 mb-4`} />
                          <h3 className="text-lg font-semibold mb-2">No Activity on {chainData.chain.name}</h3>
                          <p className="text-muted-foreground text-center">
                            This address has no tokens or transfers on the {chainData.chain.name} network
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {/* Empty State */}
      {!multiChainData && !isLoading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Multi-Chain Portfolio Comparison</h3>
            <p className="text-muted-foreground text-center">
              Enter a wallet address above to compare portfolio holdings across Ethereum, BSC, and Tron
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {SUPPORTED_CHAINS.map((chain) => (
                <Badge key={chain.id} variant="outline" className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${chain.color}`} />
                  {chain.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
