# Transaction Flow Implementation Plan

## 1. Add Transaction State Management (agent.js)
```javascript
// In PortfolioManager class
constructor(apiKey) {
  // ... existing code ...
  this.pendingTransactions = new Map() // Track pending confirmations
  this.transactionTimeout = 300_000 // 5 minutes
}
```

## 2. Create New Tool Methods (blockchain.js)
```javascript
// Add to existing exports
export async function prepareSendTransaction(walletClient, to, valueInEth) {
  // Keep existing logic from test.js
  // Return { rawTx, simulationResults, error }
}

// Modify sendTransaction to accept prepared tx
export async function sendTransaction(walletClient, rawTx) {
  // Use existing sendRawTransaction logic
}
```

## 3. Implement Prepare/Send Flow (agent.js)
```javascript
// In tools object
prepareSendTransaction: async ({ to, valueInEth }) => {
  const { walletClient } = createClients(process.env.PRIVATE_KEY)
  
  // 1. Prepare tx
  const prepResult = await prepareSendTransaction(walletClient, to, valueInEth)
  if (prepResult.error) return { error: prepResult.error }

  // 2. Simulate
  const simResult = await simulateTransactionWithAlchemy(prepResult.rawTx)
  if (simResult.error) return { error: simResult.error }

  return {
    simulation: simResult.result,
    rawTx: prepResult.rawTx,
    needsConfirmation: true
  }
}
```

## 4. Add Confirmation Handling (chat.js)
```javascript
// Modify main loop:
const { message } = await inquirer.prompt(/*...*/)

// Check for confirmation first
if (manager.handleConfirmation(message)) {
  continue // Skip normal processing
}
```

## 5. Implement State Transitions (agent.js)
```javascript
// In PortfolioManager class
async processMessage(message) {
  // Check for pending tx first
  if (this.isConfirmationResponse(message)) {
    return this.handleTransactionConfirmation(message)
  }
  
  // ... existing tool processing ...
}

async handleTransactionConfirmation(response) {
  // Match yes/no in Russian/English
  if (/^(да|yes|y)/i.test(response)) {
    // Execute pending tx
    // Call sendRawTransaction
    return "Transaction sent! Hash: " + hash
  }
  
  // Clear state
  return "Transaction canceled"
}
```

## 6. Format Simulation Results
```javascript
// In prepareSendTransaction tool
return {
  // ... existing data ...
  humanReadableSimulation: `
    📊 Simulation Results:
    - From: ${rawTx.from}
    - To: ${to}
    - Value: ${valueInEth} ETH
    - Gas: ${simResult.gasEstimate}
    - Balance Change: ${simResult.balanceChanges}
  `
}
```

## Implementation Order
1. Update `blockchain.js` with modified methods
2. Add state management to `PortfolioManager`
3. Implement new tool in `agent.js`
4. Modify chat loop in `chat.js`
5. Add confirmation handling logic
6. Update error handling throughout

## Testing Strategy
1. Test prepare/simulate flow without confirmation
2. Test successful confirmation flow
3. Test cancellation flow
4. Test timeout handling
5. Verify error paths (insufficient funds, wrong address)

## Key Dependencies
- Existing `simulateTransactionWithAlchemy` from blockchain.js
- `createClients` for wallet interactions
- Inquirer.js prompt flow in chat.js
