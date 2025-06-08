"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getNoditClient, isTransactionHash, isContractAddress, formatBalance, formatUSD } from "@/lib/nodit"
import { Search, Hash, FileText, Wallet, AlertCircle } from "lucide-react"

interface BlockchainExplorerProps {
  network: string
}

export function BlockchainExplorer({ network }: BlockchainExplorerProps) {
  const [query, setQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"transaction" | "contract" | "account" | null>(null)
  const noditClient = getNoditClient()

  const {
    data: searchResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["explorer", network, searchQuery, searchType],
    queryFn: async () => {
      if (!searchQuery || !searchType) return null

      switch (searchType) {
        case "transaction":
          return await noditClient.searchByHash(network, searchQuery)
        case "contract":
          return await noditClient.searchByContract(network, searchQuery)
        case "account":
          return await noditClient.searchByAccount(network, searchQuery)
        default:
          throw new Error("Invalid search type")
      }
    },
    enabled: !!searchQuery && !!searchType,
    staleTime: 30000,
  })
  console.log(searchType, searchResult)

  const handleSearch = () => {
    if (!query.trim()) return

    const trimmedQuery = query.trim()
    let type: "transaction" | "contract" | "account"

    if (isTransactionHash(trimmedQuery)) {
      type = "transaction"
    } else if (isContractAddress(trimmedQuery)) {
      type = "contract"
    } else {
      type = "account"
    }

    setSearchType(type)
    setSearchQuery(trimmedQuery)
  }

  const renderTransactionResult = (data: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Transaction Details
        </CardTitle>
        <CardDescription>Transaction hash: {searchQuery}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Block Number</p>
            <p className="font-mono">{data.block_number}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={data.status === "success" ? "default" : "destructive"}>{data.status || "Unknown"}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-mono text-sm break-all">{data.from}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-mono text-sm break-all">{data.to}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Value</p>
            <p className="font-mono">{data.value || "0"} ETH</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gas Used</p>
            <p className="font-mono">{data.gas_used || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContractResult = (data: any) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Information
          </CardTitle>
          <CardDescription>Contract address: {searchQuery}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.metadata && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{data.metadata.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Symbol</p>
                <p className="font-semibold">{data.metadata.symbol}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Decimals</p>
                <p className="font-mono">{data.metadata.decimals}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Supply</p>
                <p className="font-mono">{formatBalance(data.metadata.totalSupply, data.metadata.decimals)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data.holders && data.holders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Holders</CardTitle>
            <CardDescription>Largest token holders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.holders.map((holder: any, index: number) => (
                <div key={holder.ownerAddress} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{holder.ownerAddress}</p>
                    <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                    {((Number(holder.balance) / Number(data.metadata?.totalSupply)) * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBalance(holder.balance, data.metadata?.decimals || 18)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderAccountResult = (data: any) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Account Overview
          </CardTitle>
          <CardDescription>Address: {searchQuery}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Token Count</p>
              <p className="text-2xl font-bold">{data.tokens?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recent Transfers</p>
              <p className="text-2xl font-bold">{data.transfers?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.tokens && data.tokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Holdings</CardTitle>
            <CardDescription>Current token balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.tokens.map((token: any) => (
                <div key={token.contract_address} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {token.name} ({token.symbol})
                    </p>
                    <p className="text-sm text-muted-foreground font-mono truncate">{token.contract_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatBalance(token.balance, token.decimals)}</p>
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

      {data.transfers && data.transfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
            <CardDescription>Latest transaction activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.transfers.map((transfer: any) => (
                <div
                  key={transfer.transaction_hash}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{transfer.token_symbol}</p>
                    <p className="text-xs text-muted-foreground">{new Date(transfer.timestamp).toLocaleString()}</p>
                    <p className="text-xs font-mono truncate">{transfer.transaction_hash}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        transfer.from_address.toLowerCase() === searchQuery.toLowerCase() ? "destructive" : "default"
                      }
                    >
                      {transfer.from_address.toLowerCase() === searchQuery.toLowerCase() ? "OUT" : "IN"}
                    </Badge>
                    <p className="text-sm font-mono mt-1">{formatBalance(transfer.value, 18)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Enter address, transaction hash, or contract address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Search Type Indicator */}
      {searchType && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {searchType === "transaction" && <Hash className="h-3 w-3 mr-1" />}
            {searchType === "contract" && <FileText className="h-3 w-3 mr-1" />}
            {searchType === "account" && <Wallet className="h-3 w-3 mr-1" />}
            {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Search
          </Badge>
          <span className="text-sm text-muted-foreground">on {network}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Failed to fetch data. Please check your input and try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {searchResult && (
        <>
          {searchResult.type === "transaction" && renderTransactionResult(searchResult.data)}
          {searchResult.type === "contract" && renderContractResult(searchResult.data)}
          {searchResult.type === "account" && renderAccountResult(searchResult.data)}
        </>
      )}

      {/* Empty State */}
      {!searchResult && !isLoading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Universal Blockchain Explorer</h3>
            <p className="text-muted-foreground text-center">
              Search for transactions, contracts, or accounts across the blockchain
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline">
                <Hash className="h-3 w-3 mr-1" />
                Transaction Hash
              </Badge>
              <Badge variant="outline">
                <FileText className="h-3 w-3 mr-1" />
                Contract Address
              </Badge>
              <Badge variant="outline">
                <Wallet className="h-3 w-3 mr-1" />
                Wallet Address
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
