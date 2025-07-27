import axios, { type AxiosInstance } from "axios"

export interface NoditConfig {
  baseURL: string
  apiKey: string
}

export interface TokenHolding {
  contract_address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  value_usd?: number
}

export interface Transfer {
  transaction_hash: string
  block_number: number
  timestamp: string
  from_address: string
  to_address: string
  value: string
  token_address: string
  token_symbol: string
  gas_fee?: string
  transaction_type?: "buy" | "sell" | "transfer" | "airdrop" | "staking" | "unknown"
}

export interface TokenPrice {
  contract_address: string
  price_usd: number
  price_change_24h: number
  timestamp?: string
}

export interface TokenHolder {
  address: string
  balance: string
  percentage: number
}

export interface TokenMetadata {
  contract_address: string
  name: string
  symbol: string
  decimals: number
  total_supply: string
}

// Tax-specific interfaces
export interface TaxableEvent {
  id: string
  transaction_hash: string
  timestamp: string
  type: "buy" | "sell" | "transfer" | "airdrop" | "staking" | "mining" | "defi_reward"
  token_symbol: string
  token_address: string
  amount: number
  price_usd: number
  cost_basis?: number
  proceeds?: number
  gain_loss?: number
  fee_usd?: number
  classification: "short_term" | "long_term" | "income" | "non_taxable"
}

export interface TaxSummary {
  total_gains: number
  total_losses: number
  net_gain_loss: number
  short_term_gains: number
  long_term_gains: number
  total_income: number
  total_fees: number
  total_transactions: number
}

export interface TaxReportRequest {
  address: string
  start_date: string
  end_date: string
  country: string
  cost_basis_method: "fifo" | "lifo" | "average_cost"
  chain: string
  network?: string
}

export interface TaxReportResponse {
  summary: TaxSummary
  taxable_events: TaxableEvent[]
  metadata: {
    address: string
    period: string
    country: string
    method: string
    generated_at: string
  }
}

class NoditClient {
  private clients: Map<string, AxiosInstance> = new Map()
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.initializeClients()
  }

  private initializeClients() {
    const chains = ["ethereum", "bsc", "tron", "arbitrum", "polygon", "optimism"]

    chains.forEach((chain) => {
      const client = axios.create({
        baseURL: `https://web3.nodit.io/v1/${chain}/mainnet`,
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      })

      // Add response interceptor for error handling
      client.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error(`Nodit API Error (${chain}):`, error.response?.data || error.message)
          throw error
        },
      )

      this.clients.set(chain, client)
    })
  }

  private getClient(chain: string): AxiosInstance {
    const client = this.clients.get(chain)
    if (!client) {
      throw new Error(`Unsupported chain: ${chain}`)
    }
    return client
  }

  // Portfolio endpoints
  async getTokensOwned(chain: string, account: string): Promise<TokenHolding[]> {
    const client = this.getClient(chain)
    const response = await client.post(`/token/getTokensOwnedByAccount`, {
      accountAddress: account,
      withCount: false
    })
    return response.data.items || []
  }

  async getTransfers(chain: string, account: string, limit = 50): Promise<Transfer[]> {
    const client = this.getClient(chain)
    const response = await client.post(`/token/getTokenTransfersByAccount`, {
      accountAddress: account,
      rpp: limit,
      withCount: false
    })
    return response.data.items || []
  }

  async getTokenPrices(chain: string, contracts: string[]): Promise<TokenPrice[]> {
    const client = this.getClient(chain)
    try {
      console.log(`🔍 Fetching prices for ${contracts.length} tokens on ${chain}`)
      const response = await client.post("/token/getTokenPricesByContracts", {
        contractAddresses: contracts,
        currency: "USD"
      })
      console.log(`✅ Successfully fetched ${response.data?.length || 0} prices`)

      // Map the response to match our TokenPrice interface
      const prices = response.data?.map((item: any, index: number) => ({
        contract_address: contracts[index],
        price_usd: parseFloat(item.price || "0"),
        price_change_24h: parseFloat(item.percentChangeFor24h || "0"),
        timestamp: item.updatedAt
      })) || []

      return prices
    } catch (error) {
      console.warn(`❌ Failed to fetch token prices for ${chain}:`, error)
      return []
    }
  }

  async getBalanceChanges(chain: string, account: string): Promise<any[]> {
    // This endpoint doesn't exist in Nodit API - returning empty array
    console.warn(`⚠️ getBalanceChanges endpoint not available in Nodit API`)
    return []
  }

  // Whale detection endpoints
  async getTokenHolders(chain: string, contractAddress: string): Promise<TokenHolder[]> {
    const client = this.getClient(chain)
    const response = await client.post(`/token/getTokenHoldersByContract`, {
      contractAddress,
      withCount: false
    })

    // Map the response to match our TokenHolder interface
    const holders = response.data.items?.map((item: any) => ({
      address: item.ownerAddress,
      balance: item.balance,
      percentage: 0 // Will need to calculate this based on total supply
    })) || []

    return holders
  }

  async getTokenMetadata(chain: string, contracts: string[]): Promise<TokenMetadata[]> {
    const client = this.getClient(chain)
    const response = await client.post("/token/getTokenContractMetadataByContracts", {
      contractAddresses: contracts,
    })
    return response.data.items || []
  }

  // Explorer utilities
  async searchByHash(chain: string, hash: string): Promise<any> {
    const client = this.getClient(chain)
    try {
      const response = await client.post(`/transaction/getTransactionByHash`, {
        transactionHash: hash,
      })
      return { type: "transaction", data: response.data }
    } catch (error) {
      throw new Error("Transaction not found")
    }
  }

  async searchByContract(chain: string, address: string): Promise<any> {
    const client = this.getClient(chain)
    try {
      const metadata = await this.getTokenMetadata(chain, [address])
      const holders = await this.getTokenHolders(chain, address)
      return {
        type: "contract",
        data: {
          metadata: metadata[0],
          holders: holders.slice(0, 10),
        },
      }
    } catch (error) {
      throw new Error("Contract not found")
    }
  }

  async searchByAccount(chain: string, address: string): Promise<any> {
    const client = this.getClient(chain)
    try {
      const [tokens, transfers] = await Promise.all([
        this.getTokensOwned(chain, address),
        this.getTransfers(chain, address, 10),
      ])
      return {
        type: "account",
        data: { tokens, transfers },
      }
    } catch (error) {
      throw new Error("Account not found")
    }
  }

  // TAX REPORTING IMPLEMENTATION
  // Main tax report 
  generateTaxReport = async (request: TaxReportRequest): Promise<TaxReportResponse> => {
    try {
      console.log("🏁 Starting tax report generation for:", request.address)
      console.log("📋 Request details:", request)

      const transactions = await this.fetchTransactionsForPeriod(
        request.chain,
        request.address,
        request.start_date,
        request.end_date,
        request.network || "mainnet",
      )
      console.log(`📊 Fetched ${transactions.length} transactions`)

      const transactionsWithPrices = await this.enrichTransactionsWithPrices(
        request.chain,
        transactions,
        request.network || "mainnet",
      )
      console.log("💰 Enriched transactions with historical prices")

      const classifiedTransactions = this.classifyTransactions(transactionsWithPrices, request.address)
      console.log("🏷️ Classified transaction types")

      const taxableEvents = this.calculateTaxableEvents(
        classifiedTransactions,
        request.cost_basis_method,
        request.country,
      )
      console.log(`📈 Calculated ${taxableEvents.length} taxable events`)

      const summary = this.aggregateTaxSummary(taxableEvents)
      console.log("📋 Generated tax summary:", summary)

      return {
        summary,
        taxable_events: taxableEvents,
        metadata: {
          address: request.address,
          period: `${request.start_date} to ${request.end_date}`,
          country: request.country,
          method: request.cost_basis_method,
          generated_at: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error("❌ Tax report generation failed:", error)
      throw new Error(`Failed to generate tax report: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getTransactionsByAccount(
    chain: string,
    account: string,
    network: string,
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    const client = this.getClient(chain)
    console.log("🔍 API Request:", {
      chain,
      account,
      network,
      startDate,
      endDate,
      url: `${client.defaults.baseURL}/transaction/getTransactionsByAccount`
    })

    try {
      const response = await client.post(`/transaction/getTransactionsByAccount`, {
        accountAddress: account,
        fromDate: `${startDate}T00:00:00+00:00`,
        toDate: `${endDate}T23:59:59+00:00`,
        withCount: false,
        withLogs: false,
        withDecode: false,
      })

      console.log("📊 API Response:", {
        status: response.status,
        statusText: response.statusText,
        dataKeys: Object.keys(response.data || {}),
        transactionsCount: response.data?.items?.length || 0,
        sampleTransaction: response.data?.items?.[0] || null,
        fullResponse: response.data
      })

      return response.data.items || []
    } catch (error: any) {
      console.error("❌ API Error Details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      })
      throw error
    }
  }

  private fetchTransactionsForPeriod = async (
    chain: string,
    address: string,
    startDate: string,
    endDate: string,
    network: string,
  ): Promise<any[]> => {
    console.log("🔍 Fetching transactions for period:", startDate, "to", endDate)

    try {
      const transactions = await this.getTransactionsByAccount(chain, address, network, startDate, endDate)

      console.log(`📅 Fetched ${transactions.length} transactions within date range`)
      console.log("📋 Sample transaction data:", transactions[0] || "No transactions found")
      return transactions
    } catch (error) {
      console.error("Error fetching transactions for period:", error)
      throw error
    }
  }

  private enrichTransactionsWithPrices = async (
    chain: string,
    transactions: any[],
    network: string,
  ): Promise<(any & { price_usd: number })[]> => {
    console.log("💱 Fetching historical prices for transactions")
    console.log("📋 Raw transaction sample:", transactions[0])

    try {
      // Get unique token addresses from transactions - fix the token address extraction
      const uniqueTokens = [
        ...new Set(transactions.map((tx) => {
          // Try to get the actual token contract address from the transaction
          // For ERC-20 transfers, the token address might be in different fields
          return tx.contractAddress || tx.tokenAddress || tx.to || null
        }).filter(Boolean)),
      ]

      console.log("🔍 Unique tokens found:", uniqueTokens)

      let prices: TokenPrice[] = []
      if (uniqueTokens.length > 0) {
        try {
          prices = await this.getTokenPrices(chain, uniqueTokens)
          console.log("💰 Fetched prices for tokens:", prices.length)
        } catch (e) {
          console.warn("Price data not available for some tokens, continuing with default values")
        }
      }

      const enrichedTransactions = transactions.map((tx) => {
        // Fix token address detection
        const tokenAddress = tx.contractAddress || tx.tokenAddress || tx.to || "ETH"
        const price = prices.find((p) => p.contract_address === tokenAddress)

        let timestamp: string
        try {
          if (tx.blockTimestamp) {
            const timestampValue = parseInt(tx.blockTimestamp)
            if (!isNaN(timestampValue)) {
              const date = timestampValue < 10000000000 ? new Date(timestampValue * 1000) : new Date(timestampValue)
              timestamp = date.toISOString()
            } else {
              const date = new Date(tx.blockTimestamp)
              if (!isNaN(date.getTime())) {
                timestamp = date.toISOString()
              } else {
                // Fallback to current date
                timestamp = new Date().toISOString()
              }
            }
          } else {
            // Fallback to current date if no timestamp
            timestamp = new Date().toISOString()
          }
        } catch (error) {
          console.warn("Failed to parse timestamp for transaction:", tx.transactionHash, "Using current date")
          timestamp = new Date().toISOString()
        }

        return {
          ...tx,
          transaction_hash: tx.transactionHash,
          from_address: tx.from,
          to_address: tx.to,
          value: tx.value || "0",
          timestamp: timestamp,
          block_number: parseInt(tx.blockNumber) || 0,
          token_address: tokenAddress,
          token_symbol: tx.tokenSymbol || "ETH",
          price_usd: price?.price_usd || 0, // Default to 0 if no price data
          decimals: tx.decimals || 18, // Default to 18 decimals
        }
      })

      console.log("💰 Enriched transaction sample:", enrichedTransactions[0])
      console.log(`📊 Enriched ${enrichedTransactions.length} transactions`)
      return enrichedTransactions
    } catch (error) {
      console.error("Error enriching transactions with prices:", error)
      throw error
    }
  }

  private classifyTransactions = (
    transactions: (any & { price_usd: number })[],
    userAddress: string,
  ): (any & { price_usd: number; transaction_type: string })[] => {
    console.log("🏷️ Classifying transaction types")
    console.log(`👤 User address: ${userAddress}`)

    return transactions.map((tx, index) => {
      let transactionType = "unknown"

      const isIncoming = tx.to_address?.toLowerCase() === userAddress.toLowerCase()
      const isOutgoing = tx.from_address?.toLowerCase() === userAddress.toLowerCase()

      console.log(`🔍 Classifying transaction ${index + 1}:`, {
        hash: tx.transaction_hash,
        from: tx.from_address,
        to: tx.to_address,
        isIncoming,
        isOutgoing,
        value: tx.value
      })

      // Enhanced classification logic
      if (isIncoming && !isOutgoing) {
        // Receiving tokens
        if (
          tx.from_address === "0x0000000000000000000000000000000000000000" ||
          tx.from_address === null ||
          tx.from_address === undefined
        ) {
          transactionType = "airdrop" // or mining/minting
        } else if (tx.value === "0" || !tx.value) {
          transactionType = "airdrop" // Zero-value transfers are often airdrops
        } else {
          transactionType = "buy" // or transfer in
        }
      } else if (isOutgoing && !isIncoming) {
        // Sending tokens
        if (tx.to_address === "0x0000000000000000000000000000000000000000") {
          transactionType = "burn"
        } else {
          transactionType = "sell" // or transfer out
        }
      } else if (isIncoming && isOutgoing) {
        // Self-transfer or contract interaction
        transactionType = "transfer"
      }

      // Additional classification based on transaction patterns
      if (tx.methodId || tx.input) {
        // Contract interactions might be DeFi activities
        if (tx.methodId === "0xa9059cbb") {
          // transfer
          transactionType = "transfer"
        } else if (tx.methodId === "0x095ea7b3") {
          // approve
          transactionType = "approval"
        }
      }

      console.log(`🏷️ Classified as: ${transactionType}`)

      return {
        ...tx,
        transaction_type: transactionType,
      }
    })
  }

  private calculateTaxableEvents = (
    transactions: any[],
    costBasisMethod: "fifo" | "lifo" | "average_cost",
    country: string,
  ): TaxableEvent[] => {
    console.log(`📊 Calculating taxable events using ${costBasisMethod.toUpperCase()} method`)
    console.log(`📋 Processing ${transactions.length} transactions`)

    const taxableEvents: TaxableEvent[] = []
    const holdings: Map<string, Array<{ amount: number; cost_basis: number; date: Date }>> = new Map()

    transactions.forEach((tx, index) => {
      console.log(`🔍 Processing transaction ${index + 1}/${transactions.length}:`, {
        hash: tx.transaction_hash,
        type: tx.transaction_type,
        value: tx.value,
        from: tx.from_address,
        to: tx.to_address,
        token_address: tx.token_address,
        decimals: tx.decimals
      })

      const amount = Number.parseFloat(tx.value || "0") / Math.pow(10, tx.decimals || 18)
      const priceUsd = tx.price_usd || 0
      const totalValue = amount * priceUsd
      const txDate = new Date(tx.timestamp)
      const tokenAddress = tx.token_address || "ETH"

      console.log(`💰 Transaction details:`, {
        amount,
        priceUsd,
        totalValue,
        tokenAddress
      })

      if (amount === 0) {
        console.log(`⏭️ Skipping zero-value transaction: ${tx.transaction_hash}`)
        return
      }

      if (!holdings.has(tokenAddress)) {
        holdings.set(tokenAddress, [])
      }

      const tokenHoldings = holdings.get(tokenAddress)!

      if (tx.transaction_type === "buy" || tx.transaction_type === "airdrop") {
        console.log(`📥 Adding ${amount} tokens to holdings (${tx.transaction_type})`)
        // Add to holdings
        tokenHoldings.push({
          amount,
          cost_basis: priceUsd,
          date: txDate,
        })

        if (tx.transaction_type === "buy") {
          console.log(`🛒 Creating buy taxable event: ${amount} tokens`)
          taxableEvents.push({
            id: `${tx.transaction_hash}-${index}`,
            transaction_hash: tx.transaction_hash,
            timestamp: tx.timestamp,
            type: "buy",
            token_symbol: tx.token_symbol || "UNKNOWN",
            token_address: tokenAddress,
            amount,
            price_usd: priceUsd,
            cost_basis: totalValue, // Cost basis is the purchase price
            classification: "short_term", // Show in taxable events table
          })
        }

        // Airdrops and mining are taxable income
        if (tx.transaction_type === "airdrop") {
          console.log(`🎁 Creating airdrop taxable event: ${totalValue} USD`)
          taxableEvents.push({
            id: `${tx.transaction_hash}-${index}`,
            transaction_hash: tx.transaction_hash,
            timestamp: tx.timestamp,
            type: "airdrop",
            token_symbol: tx.token_symbol || "UNKNOWN",
            token_address: tokenAddress,
            amount,
            price_usd: priceUsd,
            proceeds: totalValue,
            gain_loss: totalValue, // Full value is income
            classification: "income",
          })
        }
      } else if (tx.transaction_type === "sell") {
        console.log(`📤 Processing sell transaction: ${amount} tokens`)
        // Calculate gains/losses using specified method
        let remainingAmount = amount
        let totalCostBasis = 0
        const totalProceeds = totalValue

        while (remainingAmount > 0 && tokenHoldings.length > 0) {
          let holdingIndex = 0

          if (costBasisMethod === "lifo") {
            holdingIndex = tokenHoldings.length - 1 // Last in, first out
          } else if (costBasisMethod === "fifo") {
            holdingIndex = 0 // First in, first out
          } else if (costBasisMethod === "average_cost") {
            // For average cost, calculate weighted average
            const totalHoldings = tokenHoldings.reduce((sum, h) => sum + h.amount, 0)
            const totalCost = tokenHoldings.reduce((sum, h) => sum + h.amount * h.cost_basis, 0)
            const avgCostBasis = totalCost / totalHoldings

            // Use the first holding but with average cost basis
            holdingIndex = 0
            tokenHoldings[0].cost_basis = avgCostBasis
          }

          const holding = tokenHoldings[holdingIndex]
          const usedAmount = Math.min(remainingAmount, holding.amount)
          const costBasis = usedAmount * holding.cost_basis

          totalCostBasis += costBasis
          remainingAmount -= usedAmount
          holding.amount -= usedAmount

          if (holding.amount <= 0) {
            tokenHoldings.splice(holdingIndex, 1)
          }
        }

        const gainLoss = totalProceeds - totalCostBasis

        const oldestHolding = tokenHoldings.length > 0 ? tokenHoldings[0].date : txDate
        const daysDiff = (txDate.getTime() - oldestHolding.getTime()) / (1000 * 60 * 60 * 24)
        const isLongTerm = daysDiff > 365 // More than 1 year

        console.log(`💸 Creating sell taxable event: ${gainLoss} USD gain/loss`)
        taxableEvents.push({
          id: `${tx.transaction_hash}-${index}`,
          transaction_hash: tx.transaction_hash,
          timestamp: tx.timestamp,
          type: "sell",
          token_symbol: tx.token_symbol || "UNKNOWN",
          token_address: tokenAddress,
          amount,
          price_usd: priceUsd,
          cost_basis: totalCostBasis,
          proceeds: totalProceeds,
          gain_loss: gainLoss,
          fee_usd: tx.gas_fee ? Number.parseFloat(tx.gas_fee) * priceUsd : 0,
          classification: isLongTerm ? "long_term" : "short_term",
        })
      } else {
        console.log(`ℹ️ Transaction type '${tx.transaction_type}' not processed for tax calculation`)
      }
    })

    console.log(`📊 Generated ${taxableEvents.length} taxable events`)
    console.log("📋 Taxable events details:", taxableEvents.map(event => ({
      id: event.id,
      type: event.type,
      classification: event.classification,
      amount: event.amount,
      gain_loss: event.gain_loss
    })))
    return taxableEvents
  }

  // Step 5: Aggregate totals and prepare summary
  private aggregateTaxSummary = (taxableEvents: TaxableEvent[]): TaxSummary => {
    console.log("📋 Aggregating tax summary")

    const summary: TaxSummary = {
      total_gains: 0,
      total_losses: 0,
      net_gain_loss: 0,
      short_term_gains: 0,
      long_term_gains: 0,
      total_income: 0,
      total_fees: 0,
      total_transactions: taxableEvents.length,
    }

    taxableEvents.forEach((event) => {
      const gainLoss = event.gain_loss || 0

      if (event.classification === "income") {
        summary.total_income += gainLoss
      } else if (gainLoss > 0) {
        summary.total_gains += gainLoss
        if (event.classification === "short_term") {
          summary.short_term_gains += gainLoss
        } else if (event.classification === "long_term") {
          summary.long_term_gains += gainLoss
        }
      } else if (gainLoss < 0) {
        summary.total_losses += Math.abs(gainLoss)
      }

      if (event.fee_usd) {
        summary.total_fees += event.fee_usd
      }
    })

    summary.net_gain_loss = summary.total_gains - summary.total_losses

    return summary
  }

  // Get market trend analysis
  async getMarketTrendAnalysis(chain: string, contractAddress: string): Promise<any> {
    const client = this.getClient(chain)

    try {
      const response = await client.post("/token/getMarketTrendAnalysisByContract", {
        contractAddress,
        timeframe: "7d",
        indicators: ["price", "volume", "sentiment", "momentum"]
      })
      return response.data
    } catch (error) {
      console.warn(`Failed to fetch market trend analysis for ${contractAddress}:`, error)
      return {
        trend: "neutral",
        strength: 0.5,
        confidence: 0.6,
        indicators: []
      }
    }
  }

  // Calculate wallet credit score
  async calculateCreditScore(chain: string, address: string): Promise<any> {
    const client = this.getClient(chain)

    try {
      // Get portfolio data for credit score calculation
      const [tokens, transfers] = await Promise.all([
        this.getTokensOwned(chain, address),
        this.getTransfers(chain, address, 100)
      ])

      // Calculate credit score based on portfolio metrics
      const totalValue = tokens.reduce((sum, t) => sum + (t.value_usd || 0), 0)
      const totalTokens = tokens.length
      const totalTransactions = transfers.length
      const uniqueInteractions = new Set(transfers.map(t => t.from_address).concat(transfers.map(t => t.to_address))).size - 1 // Exclude self

      // Calculate individual scores
      const activityScore = Math.min(100, Math.max(0, (totalTransactions / 50) * 100))
      const diversityScore = Math.min(100, Math.max(0, (totalTokens / 10) * 100))
      const valueScore = Math.min(100, Math.max(0, (totalValue / 10000) * 100))
      const networkScore = Math.min(100, Math.max(0, (uniqueInteractions / 20) * 100))
      const ageScore = 75 // Mock account age score

      // Calculate overall score
      const overallScore = Math.round(
        (activityScore * 0.25) +
        (diversityScore * 0.2) +
        (valueScore * 0.25) +
        (networkScore * 0.2) +
        (ageScore * 0.1)
      )

      // Determine rating
      let rating = "Very Poor"
      if (overallScore >= 90) rating = "Excellent"
      else if (overallScore >= 75) rating = "Good"
      else if (overallScore >= 60) rating = "Fair"
      else if (overallScore >= 40) rating = "Poor"

      return {
        score: overallScore,
        rating,
        metrics: {
          totalValue,
          totalTokens,
          totalTransactions,
          uniqueInteractions,
          accountAge: Math.floor(Math.random() * 365) + 30, // Mock account age
          activityScore,
          diversityScore,
          valueScore,
          networkScore,
          ageScore
        }
      }
    } catch (error) {
      console.error("Error calculating credit score:", error)
      throw new Error("Failed to calculate credit score")
    }
  }
}

// Singleton instance
let noditClient: NoditClient | null = null

export function getNoditClient(): NoditClient {
  if (!noditClient) {
    const apiKey = process.env.NEXT_PUBLIC_NODIT_API_KEY || "demo-key"
    noditClient = new NoditClient(apiKey)
  }
  return noditClient
}

// Utility functions
export function isTransactionHash(query: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(query)
}

export function isContractAddress(query: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(query) || /^T[A-Za-z1-9]{33}$/.test(query)
}

export function formatBalance(balance: string, decimals: number): string {
  const value = Number.parseFloat(balance) / Math.pow(10, decimals)
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

// Tax-specific utility functions
export function formatTaxAmount(value: number): string {
  const formatted = formatUSD(Math.abs(value))
  return value < 0 ? `(${formatted})` : formatted
}

export function getTaxClassificationColor(classification: string): string {
  switch (classification) {
    case "short_term":
      return "text-red-600"
    case "long_term":
      return "text-green-600"
    case "income":
      return "text-blue-600"
    default:
      return "text-gray-600"
  }
}

export function getTaxClassificationBadge(classification: string): string {
  switch (classification) {
    case "short_term":
      return "destructive"
    case "long_term":
      return "default"
    case "income":
      return "secondary"
    default:
      return "outline"
  }
}
