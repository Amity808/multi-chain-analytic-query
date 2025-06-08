"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatUSD } from "@/lib/nodit"
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"

interface TokenHoldingsTableProps {
  tokens: Array<{
    contract_address: string
    name: string
    symbol: string
    balance_formatted: number
    price_usd: number
    value_usd: number
    price_change_24h: number
  }>
}

type SortField = "name" | "balance" | "value" | "price" | "change"
type SortDirection = "asc" | "desc"

export function TokenHoldingsTable({ tokens }: TokenHoldingsTableProps) {
  const [sortField, setSortField] = useState<SortField>("value")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedTokens = [...tokens].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "balance":
        aValue = a.balance_formatted
        bValue = b.balance_formatted
        break
      case "value":
        aValue = a.value_usd
        bValue = b.value_usd
        break
      case "price":
        aValue = a.price_usd
        bValue = b.price_usd
        break
      case "change":
        aValue = a.price_change_24h
        bValue = b.price_change_24h
        break
      default:
        aValue = a.value_usd
        bValue = b.value_usd
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
  })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-auto p-0 font-semibold">
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )

  if (!tokens.length) {
    return <div className="text-center py-8 text-muted-foreground">No token holdings found</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="name">Token</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="balance">Balance</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="price">Price</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="change">24h Change</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="value">Value</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTokens.map((token) => (
            <TableRow key={token.contract_address}>
              <TableCell>
                <div>
                  <div className="font-semibold">{token.name}</div>
                  <div className="text-sm text-muted-foreground">{token.symbol}</div>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {token.balance_formatted.toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}
              </TableCell>
              <TableCell className="text-right">{token.price_usd > 0 ? formatUSD(token.price_usd) : "N/A"}</TableCell>
              <TableCell className="text-right">
                {token.price_change_24h !== 0 ? (
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
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {token.value_usd > 0 ? formatUSD(token.value_usd) : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
