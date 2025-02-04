# DEFI Copilot MVP PRD (1-Day Terminal App)

## Core Objective
Deliver a terminal-based conversational interface demonstrating core onboarding flow and simulated DEFI interactions

## Key Features to Implement

1. **Mode Selection**
   - Simple text menu for onboarding/investment mode choice
   - Persist mode in memory (no DB needed)

2. **Simulated Wallet**
   - Generate mock ETH address
   - Track testnet balance (start with 0.1 ETH)
   - Faucet simulation (+0.5 ETH per use)

3. **Portfolio Manager AI**
   - Hardcoded responses for:
     - Protocol explanations (Uniswap, Aave, Compound)
     - Risk tolerance assessment
     - Basic strategy suggestions

4. **Transaction Simulation**
   - Mock yield farming returns
   - Simple APY calculations
   - Transaction confirmation prompts

## User Flow
1. `node index.js` → Show ASCII art logo
2. Mode selection prompt
3. Wallet creation simulation
4. Main loop:
   - [F]aucet (testnet only)
   - [B]alance check
   - [S]trategy suggestion
   - [T]ransaction simulation
   - [Q]uit

## Technical Plan

```js
// Example architecture outline
const CLI = {
  mainLoop() {
    // Use Inquirer.js for menu prompts
    // Switch between command handlers
  }
}

const Wallet = {
  create() {
    // Generate fake 0x address
    // Track balance in memory
  }
}

const PortfolioManager = {
  async respond(query) {
    // Use mock responses instead of LLM
    // Pre-built strategy templates
  }
}
```

## Non-Functional Requirements
1. Terminal-friendly formatting (80 cols max)
2. No external dependencies except:
   - `inquirer` for CLI interactions
   - `chalk` for colors
3. All data in memory (no persistence)

## Milestones (8h)
1. Hour 0-1: Project setup + ASCII art
2. Hour 1-3: Core CLI loop
3. Hour 3-5: Wallet simulation
4. Hour 5-6: Strategy templates
5. Hour 6-7: Transaction math
6. Hour 7-8: Polish + error handling

## Risks & Mitigation
1. **Risk:** Over-scoping → Stick to mock data
2. **Risk:** Complex math → Use fixed APY percentages
3. **Risk:** State loss → Accept in-memory only

## Success Metrics
1. User can complete full onboarding flow
2. Basic strategy suggestions work without errors
3. Balance updates visible after transactions
