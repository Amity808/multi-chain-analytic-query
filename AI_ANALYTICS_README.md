# AI-Powered Crypto Analytics Dashboard

## Overview

This crypto analytics dashboard now includes advanced AI-powered analytics using OpenAI's GPT-4 model to provide intelligent insights for crypto portfolios. The AI analytics engine integrates with the Nodit API to collect real-time blockchain data and generates personalized recommendations.

## Features

### 🤖 AI Analytics Engine

The AI analytics engine provides five types of analysis:

1. **Price Prediction** 📈

   - 7-30 day price forecasts
   - Confidence intervals
   - Technical analysis insights
   - Market sentiment analysis

2. **Portfolio Recommendations** 🎯

   - Asset allocation suggestions
   - Rebalancing opportunities
   - Risk management strategies
   - Diversification improvements

3. **Risk Assessment** 🛡️

   - Concentration risk analysis
   - Volatility exposure
   - Liquidity risk evaluation
   - Market correlation analysis
   - Regulatory risk assessment

4. **Market Trends** 📊

   - Sector performance analysis
   - Market sentiment evaluation
   - Macroeconomic factor analysis
   - Technical indicator correlation
   - Trend direction and strength

5. **Trading Timing** ⏰
   - Optimal entry/exit timing
   - Market cycle analysis
   - Volatility pattern recognition
   - Momentum indicator analysis
   - Risk/reward ratio optimization

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Nodit API Key (for blockchain data)
NEXT_PUBLIC_NODIT_API_KEY=your_nodit_api_key_here

# OpenAI API Key (for AI analytics)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. API Keys Setup

#### Nodit API

1. Sign up at [Nodit.io](https://nodit.io)
2. Get your API key from the dashboard
3. Add to environment variables

#### OpenAI API

1. Sign up at [OpenAI](https://platform.openai.com)
2. Create an API key
3. Add to environment variables

### 3. Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Usage

### Accessing AI Analytics

1. **From Main Dashboard**: Click the "AI Analytics" tab
2. **Direct URL**: Navigate to `/ai-analytics`

### Generating AI Insights

1. **Enter Wallet Address**: Input the wallet address you want to analyze
2. **Select Blockchain**: Choose the blockchain network (Ethereum, BSC, Polygon, etc.)
3. **Choose Analysis Type**: Select from the five analysis types
4. **Generate Analysis**: Click "Generate AI Analysis"

### Understanding Results

Each analysis provides:

- **Confidence Score**: How reliable the AI prediction is (0-100%)
- **Insights**: Detailed analysis data in JSON format
- **Recommendations**: Actionable suggestions for your portfolio
- **Warnings**: Potential risks or concerns to be aware of

## Technical Architecture

### AI Analytics Engine

```typescript
class AIAnalyticsEngine {
  // Collects market data from Nodit API
  private async collectMarketData(address: string, chain: string);

  // Generates AI insights using OpenAI GPT-4
  private async generateAIInsight(analysisType: string, marketData: any);

  // Builds specialized prompts for each analysis type
  private buildAnalysisPrompt(analysisType: string, marketData: any);

  // Provides fallback analysis when AI is unavailable
  private generateFallbackAnalysis(analysisType: string, marketData: any);
}
```

### Data Flow

1. **Data Collection**: Nodit API provides portfolio and transaction data
2. **Data Processing**: Raw blockchain data is cleaned and structured
3. **AI Analysis**: GPT-4 analyzes the data with specialized prompts
4. **Result Presentation**: Insights are displayed in an intuitive UI

### Error Handling

- **API Failures**: Graceful fallback to basic analysis
- **Rate Limiting**: Automatic retry with exponential backoff
- **Invalid Data**: Validation and error messages
- **Network Issues**: Offline mode with cached data

## API Integration

### Nodit API Endpoints Used

- `getTokensOwned()`: Portfolio token holdings
- `getTransfers()`: Transaction history
- `getTokenPrices()`: Current price data

### OpenAI API Integration

- **Model**: GPT-4
- **Temperature**: 0.3 (balanced creativity and consistency)
- **Max Tokens**: 2000
- **System Prompt**: Crypto analytics expert role

## Security Considerations

### Data Privacy

- Wallet addresses are processed locally
- No personal data is stored permanently
- API keys are kept secure in environment variables

### Rate Limiting

- OpenAI API calls are rate-limited
- Nodit API calls are optimized for efficiency
- Fallback mechanisms prevent service disruption

## Performance Optimization

### Caching Strategy

- Analysis results are cached temporarily
- Portfolio data is refreshed on demand
- Price data is cached for 5 minutes

### Loading States

- Progress indicators for long-running analyses
- Skeleton loading for UI components
- Graceful degradation for slow networks

## Troubleshooting

### Common Issues

1. **"AI analysis temporarily unavailable"**

   - Check OpenAI API key configuration
   - Verify API quota and billing
   - Check network connectivity

2. **"Failed to collect market data"**

   - Verify Nodit API key
   - Check wallet address format
   - Ensure blockchain network is supported

3. **Low confidence scores**
   - Insufficient transaction history
   - Limited price data available
   - New or illiquid tokens

### Debug Mode

Enable detailed logging by adding to your browser console:

```javascript
localStorage.setItem("debug", "ai-analytics");
```

## Future Enhancements

### Planned Features

1. **Advanced Analytics**

   - DeFi protocol analysis
   - NFT portfolio insights
   - Cross-chain correlation analysis

2. **Machine Learning Integration**

   - Custom ML models for specific tokens
   - Historical pattern recognition
   - Predictive modeling improvements

3. **Real-time Updates**

   - WebSocket connections for live data
   - Push notifications for significant events
   - Automated portfolio monitoring

4. **Enhanced UI**
   - Interactive charts and graphs
   - 3D portfolio visualization
   - Mobile-optimized interface

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits for version control

## Support

For technical support or feature requests:

1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue on GitHub
4. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This AI analytics feature is for educational and informational purposes only. It should not be considered as financial advice. Always conduct your own research and consult with financial professionals before making investment decisions.
