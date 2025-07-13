
usdc eth
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48


usdc holder 
"0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341"


# Crypto Analytics Dashboard

A comprehensive crypto analytics platform powered by **Nodit API** and **OpenAI**, featuring ML-powered insights, multi-chain portfolio tracking, and advanced trading analytics.

## 🚀 Features

### 🤖 ML-Powered Analytics
- **Token Price Prediction Models**: AI-driven price forecasts using LSTM and Transformer models
- **Portfolio Rebalancing Recommendations**: Smart allocation suggestions based on market conditions
- **Risk Assessment Scoring**: Comprehensive risk analysis with mitigation strategies
- **Market Trend Analysis**: Real-time sentiment and trend detection
- **Optimal Trading Timing**: AI-powered entry/exit recommendations

### 📊 Multi-Chain Portfolio Tracking
- Support for Ethereum, BSC, Tron, Arbitrum, Polygon, Optimism, Avalanche, Solana
- Real-time portfolio valuation and performance metrics
- Historical data analysis and visualization
- Whale detection and tracking

### 📈 Advanced Analytics
- Interactive charts and visualizations
- Real-time market data integration
- Technical indicator analysis
- On-chain metrics and insights

### 💰 Tax Reporting
- Automated tax report generation
- Multi-jurisdiction support
- Cost basis method selection
- Export to CSV/PDF formats

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Chart.js
- **AI/ML**: OpenAI GPT-4 integration
- **Blockchain Data**: Nodit API
- **State Management**: React hooks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm or npm
- Nodit API key
- OpenAI API key (optional, for advanced ML features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crypto-analytics-dashboard
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
NEXT_PUBLIC_NODIT_API_KEY=your_nodit_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 📱 Usage

### ML Insights Dashboard
1. Navigate to **ML Insights** in the navigation
2. Enter a wallet address and select the blockchain network
3. Choose your preferred prediction model
4. Click **Generate ML Insights** to get AI-powered analysis

### Features Available:
- **Token Price Predictions**: View predicted prices with confidence scores
- **Portfolio Rebalancing**: Get recommended allocation changes
- **Risk Assessment**: Comprehensive risk analysis with mitigation strategies
- **Market Trends**: Real-time trend analysis and sentiment
- **Trading Timing**: Optimal entry/exit recommendations

### Multi-Chain Portfolio Tracking
1. Enter any wallet address
2. Select the blockchain network
3. View real-time portfolio data and analytics

### Tax Report Generation
1. Navigate to **Tax Reports**
2. Enter wallet address and select network
3. Choose tax year and jurisdiction
4. Select cost basis method
5. Generate comprehensive tax reports

## 🔧 Configuration

### Supported Networks
- Ethereum (Mainnet)
- BSC (Binance Smart Chain)
- Tron
- Arbitrum
- Polygon
- Optimism
- Avalanche
- Solana

### ML Models
- **LSTM Neural Network**: Advanced time series prediction
- **Transformer Model**: State-of-the-art attention-based model
- **Ensemble Model**: Combines multiple models for accuracy

### Risk Assessment
- Market Risk Analysis
- Concentration Risk Evaluation
- Liquidity Risk Assessment
- Volatility Index Calculation

## 📊 API Integration

### Nodit API
The dashboard integrates with Nodit API for:
- Portfolio data retrieval
- Transaction history
- Token balances
- Multi-chain support

### OpenAI Integration
For advanced ML features:
- Market sentiment analysis
- Trading recommendations
- Risk assessment insights
- Portfolio optimization suggestions

## 🎨 UI Components

Built with Shadcn/ui components:
- Responsive design
- Dark/light theme support
- Accessible components
- Modern UI/UX

## 📈 Charts and Visualizations

- Interactive price charts
- Portfolio allocation pie charts
- Risk assessment visualizations
- Trend analysis graphs
- Trading timing indicators

## 🔒 Security

- Environment variable protection
- API key security
- Client-side data validation
- Secure data transmission

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced ML models
- [ ] Social trading features
- [ ] DeFi protocol integration
- [ ] NFT analytics
- [ ] Institutional features

---

**Built with ❤️ using Next.js, Nodit API, and OpenAI**