"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PortfolioVisualizer } from "@/components/dashboard/portfolio-visualizer"
import { WhaleDetector } from "@/components/dashboard/whale-detector"
import { BlockchainExplorer } from "@/components/dashboard/blockchain-explorer"
import { MultiChainDashboard } from "@/components/dashboard/multi-chain-dashboard"
import { TokenPriceTracker } from "@/components/dashboard/token-price-tracker"
import { WalletCreditScore } from "@/components/dashboard/wallet-credit-score"
import { NetworkSelector } from "@/components/ui/network-selector"
import { TrendingUp, Search, Users, BarChart3, CreditCard, DollarSign } from "lucide-react"

export default function CryptoAnalyticsDashboard() {
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Crypto Analytics Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Powered by Nodit API - Multi-chain portfolio and whale tracking
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <NetworkSelector selectedNetwork={selectedNetwork} onNetworkChange={setSelectedNetwork} />
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="whales" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Whales
            </TabsTrigger>
            <TabsTrigger value="multichain" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Multi-Chain
            </TabsTrigger>
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Prices
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Portfolio Visualizer
                </CardTitle>
                <CardDescription>
                  Track your token holdings, transfers, and portfolio value across chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioVisualizer network={selectedNetwork} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explorer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Universal Blockchain Explorer
                </CardTitle>
                <CardDescription>
                  Search for addresses, transactions, and contracts across multiple chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainExplorer network={selectedNetwork} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Whale Detector
                </CardTitle>
                <CardDescription>Identify large token holders and analyze distribution patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <WhaleDetector network={selectedNetwork} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multichain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Multi-Chain Dashboard
                </CardTitle>
                <CardDescription>
                  Compare portfolios and activities across different blockchain networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiChainDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Token Price Tracker
                </CardTitle>
                <CardDescription>Track real-time prices of your favorite tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <TokenPriceTracker />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Wallet Credit Score
                </CardTitle>
                <CardDescription>Analyze wallet reputation and activity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <WalletCreditScore />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
