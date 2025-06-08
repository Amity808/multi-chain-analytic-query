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
}

export interface TokenPrice {
  contract_address: string
  price_usd: number
  price_change_24h: number
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

class NoditClient {
  private clients: Map<string, AxiosInstance> = new Map()
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.initializeClients()
  }

  private initializeClients = () => {
    const chains = ["ethereum", "sepolia", "base", "bsc", "tron"]

    chains.forEach((chain) => {
      const client = axios.create({
        baseURL: `https://web3.nodit.io/v1/${chain}`,
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
          accept: "application/json",
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

  private getClient = (chain: string, network = "mainnet"): AxiosInstance => {
    const client = this.clients.get(chain)
    if (!client) {
      throw new Error(`Unsupported chain: ${chain}`)
    }
    // We'll add the network to the URL in each request
    return client
  }

  // Portfolio endpoints
  getTokensOwned = async (chain: string, account: string, network = "mainnet"): Promise<TokenHolding[]> => {
    const client = this.getClient(chain, network)
    const response = await client.post(`/${network}/token/getTokensOwnedByAccount`, {
      accountAddress: account,
      withCount: false,
    })
    return response.data.items || []
  }

  getTransfers = async (chain: string, account: string, network = "mainnet") => {
    const client = this.getClient(chain, network)
    const response = await client.post(`/${network}/token/getTokenTransfersByAccount`, {
      accountAddress: account,
      withCount: false,
    })
    return response.data.items || []
  }

  getTransactionsByAccount = async (
    chain: string,
    account: string,
    network = "mainnet",
    fromDate?: string,
    toDate?: string,
  ): Promise<Transfer[]> => {
    const client = this.getClient(chain, network)
    const payload: any = {
      accountAddress: account,
      withCount: false,
      withLogs: false,
      withDecode: false,
    }

    if (fromDate) payload.fromDate = fromDate
    if (toDate) payload.toDate = toDate

    const response = await client.post(`/${network}/blockchain/getTransactionsByAccount`, payload)
    return response.data.items || []
  }

  getTransactionByHash = async (chain: string, hash: string, network = "mainnet"): Promise<any> => {
    const client = this.getClient(chain, network)
    const response = await client.post(`/${network}/blockchain/getTransactionByHash`, {
      transactionHash: hash,
      withLogs: false,
      withDecode: false,
    })
    return response.data
  }

  getTokenPrices = async (
    chain: string,
    contracts: string[],
    network = "mainnet",
    currency = "USD",
  ): Promise<TokenPrice[]> => {
    const client = this.getClient(chain, network)
    const response = await client.post(`/${network}/token/getTokenPricesByContracts`, {
      contractAddresses: contracts,
      currency,
    })
    return response.data.items || []
  }

  getBalanceChanges = async (chain: string, account: string, network = "mainnet"): Promise<any[]> => {
    const client = this.getClient(chain, network)
    // Since the new API doesn't have a direct endpoint for balance changes,
    // we'll use transaction history to simulate this
    const response = await client.post(`/${network}/blockchain/getTransactionsByAccount`, {
      accountAddress: account,
      withCount: false,
      withLogs: false,
      withDecode: false,
    })
    return response.data.items || []
  }

  // Whale detection endpoints
  getTokenHolders = async (chain: string, contractAddress: string, network = "mainnet"): Promise<TokenHolder[]> => {
    const client = this.getClient(chain, network)
    // For this endpoint, we'll need to adapt to the new API structure
    // This is a placeholder - the actual endpoint might be different
    const response = await client.post(`/${network}/token/getTokenHoldersByContract`, {
      contractAddress,
    })
    
    return response.data.items || []
  }

  getTokenMetadata = async (chain: string, contracts: string[], network = "mainnet"): Promise<TokenMetadata[]> => {
    const client = this.getClient(chain, network)
    // Adapt to the new API structure
    const response = await client.post(`/${network}/token/getTokenContractMetadataByContracts`, {
      contractAddresses: contracts,
    })
    console.log(response)
    return response.data || []
  }

  // Explorer utilities
  searchByHash = async (chain: string, hash: string, network = "mainnet"): Promise<any> => {
    const client = this.getClient(chain, network)
    try {
      const response = await this.getTransactionByHash(chain, hash, network)
      return { type: "transaction", data: response }
    } catch (error) {
      throw new Error("Transaction not found")
    }
  }

  searchByContract = async (chain: string, address: string, network = "mainnet"): Promise<any> => {
    const client = this.getClient(chain, network)
    try {
      const metadata = await this.getTokenMetadata(chain, [address], network)
      const holders = await this.getTokenHolders(chain, address, network)
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

  searchByAccount = async (chain: string, address: string, network = "mainnet"): Promise<any> => {
    const client = this.getClient(chain, network)
    try {
      const [tokens, transactions] = await Promise.all([
        this.getTokensOwned(chain, address, network),
        this.getTransactionsByAccount(chain, address, network),
      ])
      return {
        type: "account",
        data: { tokens, transactions },
      }
    } catch (error) {
      throw new Error("Account not found")
    }
  }

  // Credit score analysis
  calculateCreditScore = async (chain: string, address: string, network = "mainnet"): Promise<any> => {
    try {
      // Get tokens owned by the account
      const tokens = await this.getTokensOwned(chain, address, network)

      // Get transaction history
      const transactions = await this.getTransactionsByAccount(chain, address, network)

      // Calculate metrics for credit score
      const totalTokens = tokens.length
      const totalTransactions = transactions.length
      const uniqueInteractions = new Set(
        transactions.map((tx) => (tx.to_address === address ? tx.from_address : tx.to_address)),
      ).size

      let totalValue = 0
      if (tokens.length > 0) {
        const contractAddresses = tokens.map((token) => token.contract_address)
        try {
          const prices = await this.getTokenPrices(chain, contractAddresses, network)

          totalValue = tokens.reduce((sum, token) => {
            const price = prices.find((p) => p.contract_address === token.contract_address)
            if (price) {
              const balance = Number.parseFloat(token.balance) / Math.pow(10, token.decimals)
              return sum + balance * price.price_usd
            }
            return sum
          }, 0)
        } catch (e) {
          console.warn("Could not fetch token prices for credit score calculation")
        }
      }

      // Calculate age of the account based on first transaction
      let accountAge = 0
      if (transactions.length > 0) {
        const sortedTx = [...transactions].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        const firstTx = sortedTx[0]
        const firstTxDate = new Date(firstTx.timestamp)
        accountAge = Math.floor((Date.now() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24)) // in days
      }

      // Calculate credit score (example algorithm)
      // This is a simplified example - a real credit score would be more complex
      const activityScore = Math.min(100, totalTransactions / 5) // Max 100 points for activity
      const diversityScore = Math.min(100, totalTokens * 10) // Max 100 points for token diversity
      const valueScore = Math.min(100, totalValue / 1000) // Max 100 points for value
      const ageScore = Math.min(100, accountAge / 30) // Max 100 points for account age (30 days = 100)
      const networkScore = Math.min(100, uniqueInteractions * 5) // Max 100 points for network

      const totalScore = Math.floor(
        activityScore * 0.25 + diversityScore * 0.2 + valueScore * 0.3 + ageScore * 0.15 + networkScore * 0.1,
      )

      // Credit rating based on score
      let rating = "Unknown"
      if (totalScore >= 90) rating = "Excellent"
      else if (totalScore >= 75) rating = "Good"
      else if (totalScore >= 60) rating = "Fair"
      else if (totalScore >= 40) rating = "Poor"
      else if (totalScore > 0) rating = "Very Poor"

      return {
        score: totalScore,
        rating,
        metrics: {
          activityScore,
          diversityScore,
          valueScore,
          ageScore,
          networkScore,
          totalTokens,
          totalTransactions,
          uniqueInteractions,
          totalValue,
          accountAge,
        },
      }
    } catch (error) {
      console.error("Error calculating credit score:", error)
      throw error
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
