# DEFI Copilot MVP PRD

## Overview
Terminal-based chat application that helps users learn about and interact with DeFi protocols through a conversational AI portfolio manager interface.

## MVP Scope
- Single user terminal app
- Focused on testnet/learning mode only
- Limited to basic DeFi operations (viewing balances, swaps, lending)
- Goerli testnet integration
- Basic portfolio tracking

## Core Features

### 1. Chat Interface
- Simple terminal-based chat UI
- Command history
- Clear conversation display
- Basic error handling

### 2. Portfolio Manager AI
- Claude-based AI agent using Anthropic API
- Maintains conversation context
- Understands basic DeFi concepts
- Can explain protocols and strategies
- Tracks user goals and risk tolerance

### 3. Wallet Integration 
- Create/import testnet wallet
- View wallet balances
- Get testnet ETH from faucet
- Execute basic transactions

### 4. DeFi Protocol Integration
- Integration with Aave on Goerli
- Basic operations:
  - Supply assets
  - Borrow assets
  - View positions
  - Calculate APY

### 5. Transaction Simulation
- Simulate transactions before execution
- Show expected outcome
- Display gas estimates

## Technical Architecture

### Components
1. CLI Application (Node.js)
   - User input/output handling
   - Chat history management
   - Command parsing

2. AI Service
   - Claude API integration
   - Conversation state management
   - DeFi knowledge base

3. Blockchain Service
   - Ethers.js for Web3 interaction
   - Wallet management
   - Transaction handling

4. Protocol Service
   - Aave SDK integration
   - Position management
   - APY calculations

### Data Storage
- Local JSON files for:
  - Chat history
  - Wallet info
  - User preferences
  - Transaction history

## User Flow

1. Initial Launch
   ```
   Welcome to DeFi Copilot!
   Would you like to create a new wallet or import existing one?
   ```

2. Wallet Setup
   ```
   Great! I've created a new testnet wallet for you.
   Address: 0x...
   Let's get some test ETH from the faucet.
   ```

3. Learning Mode
   ```
   What would you like to learn about?
   1. DeFi basics
   2. Aave lending protocol
   3. Current market rates
   ```

4. Protocol Interaction
   ```
   I can help you supply USDC to Aave.
   Current supply APY: 3.2%
   Would you like to simulate this transaction?
   ```

## MVP Limitations
- Testnet only
- Single protocol (Aave)
- Basic operations only
- No multi-wallet support
- No advanced strategies
- No historical data tracking
- No regular notifications

## Future Enhancements
- Web interface
- Multi-protocol support
- Real mainnet transactions
- Portfolio analytics
- Automated strategies
- Price alerts
- Multiple wallet support

## Success Metrics
- Successful wallet creation
- Number of simulated transactions
- Number of executed transactions
- Chat interaction depth
- User learning progression

## Implementation Timeline (1 day)
1. Morning
   - Basic CLI setup
   - Claude API integration
   - Simple chat interface

2. Afternoon
   - Wallet integration
   - Aave protocol integration
   - Transaction simulation

3. Evening
   - Testing & debugging
   - Documentation
   - Final polish

## Required APIs/SDKs
- Anthropic Claude API
- Ethers.js
- Aave V3 SDK
- Goerli RPC (Alchemy/Infura)
