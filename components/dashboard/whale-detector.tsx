"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HolderPieChart } from "@/components/charts/holder-pie-chart"
import { getNoditClient, formatBalance, isContractAddress } from "@/lib/nodit"
import { Search, Users, Download, AlertCircle } from "lucide-react"

interface WhaleDetectorProps {
  network: string
}

export function WhaleDetector({ network }: WhaleDetectorProps) {
  const [contractAddress, setContractAddress] = useState("")
  const [searchContract, setSearchContract] = useState("")
  const noditClient = getNoditClient()

  const {
    data: whaleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["whales", network, searchContract],
    queryFn: async () => {
      if (!searchContract) return null

      const [holders, metadata] = await Promise.all([
        noditClient.getTokenHolders(network, searchContract),
        noditClient.getTokenMetadata(network, [searchContract]),
      ])

      const tokenInfo = metadata[0]
      if (!tokenInfo) throw new Error("Token metadata not found")

      const totalSupply = Number.parseFloat(tokenInfo.totalSupply)

      // Calculate whale threshold (5% of total supply)
      const whaleThreshold = totalSupply * 0.05

      const holdersWithPercentage = holders.map((holder) => {
        const balance = Number.parseFloat(holder.balance)
        const percentage = (balance / totalSupply) * 100
        const isWhale = balance >= whaleThreshold

        return {
          ...holder,
          balance_formatted: formatBalance(holder.balance, tokenInfo.decimals),
          percentage,
          isWhale,
        }
      })

      const whales = holdersWithPercentage.filter((h) => h.isWhale)
      const whaleCount = whales.length
      const whalePercentage = whales.reduce((sum, whale) => sum + whale.percentage, 0)

      return {
        tokenInfo,
        holders: holdersWithPercentage,
        whales,
        whaleCount,
        whalePercentage,
        totalHolders: holders.length,
      }
    },
    enabled: !!searchContract,
    staleTime: 60000,
  })

  const handleSearch = () => {
    if (contractAddress.trim() && isContractAddress(contractAddress.trim())) {
      setSearchContract(contractAddress.trim())
    }
  }

  const exportToCSV = () => {
    if (!whaleData) return

    const csvContent = [
      ["Address", "Balance", "Percentage", "Is Whale"].join(","),
      ...whaleData.holders.map((holder) =>
        [
          holder.ownerAddress,
          holder.balance_formatted,
          holder.percentage.toFixed(2) + "%",
          holder.isWhale ? "Yes" : "No",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${whaleData.tokenInfo.symbol}_holders.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  console.log(whaleData)

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Enter token contract address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={!contractAddress.trim() || isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Detect Whales
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load whale data. Please check the contract address and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Whale Analysis Results */}
      {whaleData && (
        <>
          {/* Token Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {whaleData.tokenInfo.name} ({whaleData.tokenInfo.symbol})
                </span>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>Contract: {whaleData.tokenInfo.contract_address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-lg font-semibold">
                    {formatBalance(whaleData.tokenInfo.totalSupply, whaleData.tokenInfo.decimals)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Holders</p>
                  <p className="text-lg font-semibold">{whaleData.totalHolders.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Whale Count</p>
                  <p className="text-lg font-semibold text-orange-600">{whaleData.whaleCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Whale Ownership</p>
                  <p className="text-lg font-semibold text-red-600">{whaleData.whalePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holder Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Holder Distribution</CardTitle>
                <CardDescription>Top holders by percentage of total supply</CardDescription>
              </CardHeader>
              <CardContent>
                <HolderPieChart holders={whaleData.holders.slice(0, 10)} />
              </CardContent>
            </Card>

            {/* Whale List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Whale Addresses
                </CardTitle>
                <CardDescription>Addresses holding {">"} 5% of total supply</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {whaleData.whales.length > 0 ? (
                    whaleData.whales.map((whale, index) => (
                      <div key={whale.ownerAddress} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono truncate">{whale.ownerAddress}</p>
                          <p className="text-xs text-muted-foreground">
                            {whale.balance_formatted} {whaleData.tokenInfo.symbol}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={whale.percentage > 10 ? "destructive" : "secondary"}>
                            {whale.percentage.toFixed(2)}%
                          </Badge>
                          {index === 0 && <Badge variant="outline">Top Holder</Badge>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No whales detected</p>
                      <p className="text-sm text-muted-foreground">
                        No addresses hold more than 5% of the total supply
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Empty State */}
      {!whaleData && !isLoading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Whale Data</h3>
            <p className="text-muted-foreground text-center">
              Enter a token contract address above to detect whale holders and analyze distribution
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
