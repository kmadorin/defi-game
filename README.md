# DEFI Copilot

A gamified DEFI Portfolio Management chat app that helps users navigate the world of DeFi through an AI-powered personal portfolio manager.

## Overview

DEFI Copilot offers two primary modes:

1. **Onboarding Mode**: Risk-free learning environment using testnet/forked networks
   - Practice DeFi operations without real money
   - Access to testnet faucets
   - Safe environment to learn protocols and strategies

2. **Investment Mode**: Real mainnet operations with actual funds
   - Direct integration with Coinbase onramp
   - Real-time portfolio management
   - Live protocol interactions

## Features

- 🤖 AI Portfolio Manager powered by LangChain and Coinbase Agentkit
- 🎮 Gamified learning experience
- 💼 Smart portfolio tracking and management
- 📊 Real-time DeFi protocol interactions
- 🔒 Secure wallet integration (Coinbase Smart Wallet)
- 💳 Fiat onramp via Coinbase Offramp

[Companion bot](https://github.com/mr-procrastinator/defi-idea-analyse)
- Defi strategies explanation agent 
- 📱 Automated daily reports aggregating insights from DeFi-focused Telegram channels and on-chain data
- 🔔 Configurable alerts for important DeFi events and opportunities

TODO:
- 📈 Historical performance tracking via TheGraph/Covalent
- 🔄 Transaction simulation via Alchemy/Tenderly
- 🌐 Support for multiple DeFi protocols

## Tech Stack

- **Frontend**: React + Vite
- **Smart Contract Integration**: wagmi
- **Wallet**: Coinbase MPC Wallet/Smart Wallet
- **AI Framework**: LangChain + Coinbase Agentkit
- **Blockchain Data**: TheGraph, Covalent
- **Transaction Simulation**: Alchemy API,
- **Network Support**: Base Mainnet, Base Sepolia Testnet,

## Getting Started

### Prerequisites

- Node.js (v16+)
- Git
- Yarn/npm

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd defi-game
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Fill in required environment variables:
```bash
cp .env.example .env
```

5. Start the development server:
```bash
yarn dev
# or
npm run dev
```

## License

This project is licensed under the MIT License