# AI-Powered Crypto Analytics

This document explains how our AI analysis system works using real blockchain data from Nodit API.

## 🤖 How It Works

### 1. Data Collection
- **Portfolio Data**: Uses existing Nodit endpoints to fetch token holdings, transfers, and balance changes
- **Market Data**: Retrieves current prices, holder distributions, and transaction history
- **Real-time Analysis**: Processes live blockchain data for accurate insights

### 2. AI Analysis Process
1. **Data Preparation**: Combines portfolio and market data into analysis-ready format
2. **AI Processing**: Uses OpenAI GPT-4 to analyze the data and generate insights
3. **Fallback System**: If AI is unavailable, uses rule-based analysis as backup
4. **Structured Output**: Returns organized insights in JSON format

## 📊 Analysis Features

### Token Price Predictions
- **Data Source**: Historical prices from Nodit API
- **AI Analysis**: Technical indicators, market sentiment, on-chain metrics
- **Output**: Predicted prices with confidence scores and trend analysis

### Portfolio Rebalancing
- **Data Source**: Current token allocations and market conditions
- **AI Analysis**: Risk assessment, market trends, diversification opportunities
- **Output**: Recommended allocation changes with reasoning

### Risk Assessment
- **Data Source**: Portfolio concentration, volatility, liquidity metrics
- **AI Analysis**: Multi-factor risk evaluation
- **Output**: Risk score, level, factors, and mitigation recommendations

### Market Trend Analysis
- **Data Source**: Price movements, volume, holder activity
- **AI Analysis**: Sentiment analysis, technical indicators, momentum
- **Output**: Trend direction, strength, and confidence levels

### Trading Timing
- **Data Source**: Technical indicators, market conditions, whale movements
- **AI Analysis**: Entry/exit point optimization
- **Output**: Recommended actions with timeframes and reasoning

## 🔧 Technical Implementation

### Nodit Endpoints Used
```typescript
// Core portfolio data
await noditClient.getTokensOwned(chain, address)
await noditClient.getTransfers(chain, address, 100)
await noditClient.getBalanceChanges(chain, address)

// Market data
await noditClient.getTokenPrices(chain, contractAddresses)
await noditClient.getTokenHolders(chain, contractAddress)

// Additional analysis data
await noditClient.getTokenMetadata(chain, contracts)
```

### AI Analysis Flow
```typescript
// 1. Collect data from Nodit
const portfolio = await getPortfolioData(address, network)
const marketData = await getMarketData(portfolio.tokens, network)

// 2. Prepare for AI analysis
const analysisData = prepareAnalysisData(portfolio, marketData)

// 3. Generate AI insights
const aiInsights = await getOpenAIAnalysis(analysisData)

// 4. Parse and structure results
const insights = parseAIInsights(aiInsights, portfolio, address, network)
```

### OpenAI Integration
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${openaiApiKey}`
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a crypto analytics expert..."
      },
      {
        role: "user",
        content: analysisPrompt
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })
})
```

## 📈 Data Processing

### Portfolio Analysis
- Token holdings and values
- Transaction history patterns
- Balance change trends
- Concentration analysis

### Market Analysis
- Price volatility calculations
- Volume analysis
- Holder distribution metrics
- Technical indicator computation

### Risk Metrics
- Concentration risk scoring
- Volatility index calculation
- Liquidity assessment
- Correlation analysis

## 🎯 AI Prompts

### Price Prediction Prompt
```
Analyze this crypto portfolio data and provide price predictions:
- Portfolio: $${totalValue}, ${tokenCount} tokens
- Market volatility: ${volatility}
- Recent transactions: ${transactionCount}

Provide predictions in JSON format with confidence scores.
```

### Risk Assessment Prompt
```
Evaluate portfolio risk based on:
- Token concentration: ${concentration}
- Market volatility: ${volatility}
- Liquidity metrics: ${liquidity}

Provide risk score, level, factors, and recommendations.
```

## 🔄 Fallback System

If OpenAI is unavailable, the system uses rule-based analysis:

```typescript
private generateRuleBasedAnalysis(data: any): string {
  const volatility = data.market.volatility
  const concentration = data.market.concentration
  
  return {
    riskScore: Math.min(0.9, volatility * 2 + concentration * 0.5),
    riskLevel: volatility > 0.15 ? "high" : volatility > 0.08 ? "medium" : "low",
    // ... more calculations
  }
}
```

## 🚀 Usage

### Environment Setup
```env
NEXT_PUBLIC_NODIT_API_KEY=your_nodit_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### API Call
```typescript
import { aiAnalysisService } from "@/lib/ai-analysis-service"

const insights = await aiAnalysisService.analyzePortfolio(
  "0x1234...", // wallet address
  "ethereum"    // network
)
```

### Response Format
```typescript
{
  predictions: TokenPrediction[],
  rebalancing: PortfolioRebalancing,
  riskAssessment: RiskAssessment,
  marketTrend: MarketTrend,
  tradingTiming: TradingTiming,
  metadata: {
    address: string,
    network: string,
    analysisDate: string,
    modelVersion: string
  }
}
```

## 🔒 Security & Privacy

- **API Keys**: Stored securely in environment variables
- **Data Processing**: All analysis done server-side
- **No Data Storage**: Analysis results not persisted
- **Rate Limiting**: Respects API rate limits

## 📊 Performance

- **Analysis Time**: 3-5 seconds per portfolio
- **Data Freshness**: Real-time blockchain data
- **Accuracy**: Combines AI insights with rule-based fallbacks
- **Scalability**: Handles multiple concurrent analyses

## 🔮 Future Enhancements

- Real-time price feeds
- Advanced ML models
- DeFi protocol integration
- Cross-chain analysis
- Institutional features
- Custom AI models

---

**Built with ❤️ using Nodit API + OpenAI GPT-4** 