# DeFi Copilot

A command-line interface for interacting with Ethereum using AgentKit and LangChain.

## Features

- 📊 Check wallet balances
- 💸 Send ETH to other addresses
- 👛 View wallet address
- 🤖 AI-powered assistance using LangChain

## Prerequisites

- Node.js v16 or higher
- npm
- Coinbase Developer Platform API keys
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd defi-game
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
- `CDP_API_KEY_NAME`: Your Coinbase Developer Platform API key name
- `CDP_API_KEY_PRIVATE`: Your Coinbase Developer Platform API private key
- `OPENAI_API_KEY`: Your OpenAI API key
- `NETWORK_ID`: The network to connect to (default: base-sepolia)

## Usage

Start the application:
```bash
node index.js
```

Follow the interactive prompts to:
1. Enter your username
2. Choose from available actions:
   - Check Balance
   - Send ETH
   - Show Wallet Address
   - Quit

## Testing

The application is configured to work with Base Sepolia testnet by default. Make sure you have test ETH in your wallet before attempting transactions.

You can get test ETH from the Base Sepolia faucet.

## Error Handling

The application includes comprehensive error handling for:
- Network issues
- Insufficient funds
- Invalid addresses
- API failures

## Security

- API keys are stored in `.env` (not committed to version control)
- Input validation for addresses and amounts
- Secure wallet provider integration through AgentKit 