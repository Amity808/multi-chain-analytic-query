
usdc eth
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48


usdc holder 
"0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341"


# Crypto Analytics Dashboard

A comprehensive multi-chain cryptocurrency analytics dashboard built with Next.js, React, and Tailwind CSS that leverages the Nodit API for blockchain data analysis.

![Crypto Analytics Dashboard](https://placeholder.svg?height=400&width=800)

## 🚀 Features

### Portfolio Visualizer
- Track token holdings across multiple blockchains
- Real-time portfolio valuation with price data
- Historical balance change visualization
- Sortable token holdings table with price metrics

### Universal Blockchain Explorer
- Smart search functionality for addresses, transactions, and contracts
- Auto-detection of input type (transaction hash, contract address, wallet address)
- Detailed transaction analysis and token transfer history
- Contract metadata and holder distribution

### Whale Detector
- Identify large token holders (whales) across any token
- Visualize holder distribution with interactive pie charts
- Export holder data to CSV for further analysis
- Track concentration of ownership and whale movements

### Multi-Chain Dashboard
- Compare portfolio holdings across Ethereum, BSC, and Tron
- Parallel data fetching for efficient multi-chain analysis
- Chain-specific activity tracking and metrics
- Unified portfolio value calculation across networks

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Data Fetching**: React Query, Axios
- **Visualization**: Chart.js
- **API**: Nodit Blockchain API

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Nodit API key (sign up at [Nodit](https://nodit.io))

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crypto-analytics-dashboard.git
   cd crypto-analytics-dashboard
   ```

2. Install Depen
```
npm install
# or
yarn install
```
3. create .env
    NEXT_PUBLIC_NODIT_BASE_URL=https://api.nodit.io/api/v1
    NEXT_PUBLIC_NODIT_API_KEY=

4. Start the development server:

```shellscript
yarn run dev 
```


## Usage

### Portfolio Analysis

1. Navigate to the "Portfolio" tab
2. Enter a wallet address in the search field
3. View token holdings, value distribution, and historical trends
4. Sort tokens by various metrics (value, balance, price change)


### Blockchain Exploration

1. Go to the "Explorer" tab
2. Enter a transaction hash, contract address, or wallet address
3. View detailed information based on the input type
4. Analyze transactions, contracts, or account activity


### Whale Detection

1. Access the "Whales" tab
2. Enter a token contract address
3. View holder distribution and identify large token holders
4. Export holder data to CSV for further analysis


### Multi-Chain Comparison

1. Visit the "Multi-Chain" tab
2. Enter a wallet address to analyze
3. Compare portfolio holdings across Ethereum, BSC, and Tron
4. View chain-specific metrics and activity


## 📊 Nodit API Integration

This dashboard uses the following Nodit API endpoints:

- `/tokens/owned/{account}` - Get token holdings for an address
- `/transfers/account/{account}` - Retrieve transfer history
- `/prices/contracts` - Fetch token prices
- `/tokens/balance/changes/{account}` - Track balance fluctuations
- `/tokens/holders/contract/{contractAddress}` - Get holder distribution
- `/tokens/metadata/contracts` - Fetch token supply data


For more information about the Nodit API, visit the [official documentation](https://docs.nodit.io)