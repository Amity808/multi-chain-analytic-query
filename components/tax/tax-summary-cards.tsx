"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatUSD, type TaxSummary } from "@/lib/nodit"
import { TrendingUp, TrendingDown, DollarSign, Receipt, Calculator, FileText } from "lucide-react"

interface TaxSummaryCardsProps {
  summary: TaxSummary
}

export function TaxSummaryCards({ summary }: TaxSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Net Gain/Loss */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Gain/Loss</CardTitle>
          {summary.net_gain_loss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.net_gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatUSD(summary.net_gain_loss)}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Gains: {formatUSD(summary.total_gains)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Losses: {formatUSD(summary.total_losses)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Short-term vs Long-term */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capital Gains Breakdown</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Short-term:</span>
              <span className="font-semibold text-red-600">{formatUSD(summary.short_term_gains)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Long-term:</span>
              <span className="font-semibold text-green-600">{formatUSD(summary.long_term_gains)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Gains:</span>
              <span className="font-bold">{formatUSD(summary.total_gains)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatUSD(summary.total_income)}</div>
          <p className="text-xs text-muted-foreground mt-1">Airdrops, staking rewards, mining</p>
        </CardContent>
      </Card>

      {/* Total Fees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          <Receipt className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{formatUSD(summary.total_fees)}</div>
          <p className="text-xs text-muted-foreground mt-1">Gas fees and transaction costs</p>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_transactions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Taxable events processed</p>
        </CardContent>
      </Card>

      {/* Tax Efficiency Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tax Efficiency</CardTitle>
          <Badge variant="outline">{summary.long_term_gains > summary.short_term_gains ? "Good" : "Fair"}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.total_gains > 0 ? Math.round((summary.long_term_gains / summary.total_gains) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Long-term gains ratio</p>
        </CardContent>
      </Card>
    </div>
  )
}
