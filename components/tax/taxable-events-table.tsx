"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatUSD, formatTaxAmount, getTaxClassificationBadge, type TaxableEvent } from "@/lib/nodit"
import { ArrowUpDown, Search, Filter } from "lucide-react"

interface TaxableEventsTableProps {
  events: TaxableEvent[]
}

type SortField = "timestamp" | "type" | "token_symbol" | "amount" | "gain_loss"
type SortDirection = "asc" | "desc"

export function TaxableEventsTable({ events }: TaxableEventsTableProps) {
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [classificationFilter, setClassificationFilter] = useState("all")

  // Get unique types and classifications for filters
  const uniqueTypes = [...new Set(events.map((e) => e.type))]
  const uniqueClassifications = [...new Set(events.map((e) => e.classification))]

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.token_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.transaction_hash.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || event.type === typeFilter
    const matchesClassification = classificationFilter === "all" || event.classification === classificationFilter

    return matchesSearch && matchesType && matchesClassification
  })

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "timestamp":
        aValue = new Date(a.timestamp).getTime()
        bValue = new Date(b.timestamp).getTime()
        break
      case "type":
        aValue = a.type
        bValue = b.type
        break
      case "token_symbol":
        aValue = a.token_symbol
        bValue = b.token_symbol
        break
      case "amount":
        aValue = a.amount
        bValue = b.amount
        break
      case "gain_loss":
        aValue = a.gain_loss || 0
        bValue = b.gain_loss || 0
        break
      default:
        aValue = new Date(a.timestamp).getTime()
        bValue = new Date(b.timestamp).getTime()
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-auto p-0 font-semibold">
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by token or transaction hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classificationFilter} onValueChange={setClassificationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            {uniqueClassifications.map((classification) => (
              <SelectItem key={classification} value={classification}>
                {classification.replace("_", " ").charAt(0).toUpperCase() + classification.replace("_", " ").slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedEvents.length} of {events.length} taxable events
        </p>
        {(searchTerm || typeFilter !== "all" || classificationFilter !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setTypeFilter("all")
              setClassificationFilter("all")
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="timestamp">Date</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="type">Type</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="token_symbol">Token</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="amount">Amount</SortButton>
              </TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Cost Basis</TableHead>
              <TableHead className="text-right">Proceeds</TableHead>
              <TableHead className="text-right">
                <SortButton field="gain_loss">Gain/Loss</SortButton>
              </TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length > 0 ? (
              sortedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-sm">{new Date(event.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{event.token_symbol}</TableCell>
                  <TableCell className="text-right font-mono">
                    {event.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </TableCell>
                  <TableCell className="text-right">{formatUSD(event.price_usd)}</TableCell>
                  <TableCell className="text-right">{event.cost_basis ? formatUSD(event.cost_basis) : "-"}</TableCell>
                  <TableCell className="text-right">{event.proceeds ? formatUSD(event.proceeds) : "-"}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {event.gain_loss !== undefined ? (
                      <span className={event.gain_loss >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatTaxAmount(event.gain_loss)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTaxClassificationBadge(event.classification) as any}>
                      {event.classification.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="font-mono text-xs">
                      {event.transaction_hash.slice(0, 8)}...
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No taxable events found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
