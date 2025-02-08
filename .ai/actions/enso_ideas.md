# Enso Action Ideas for Agentkit

## Core Routing Actions
### `enso_route`
- Route tokens through optimal DeFi path
- Parameters:
  - `tokenIn`: Address/ID of input token (0x... or "ETH")
  - `tokenOut`: Target token/position address
  - `amountIn`: Input amount in wei/whole units
  - `slippage`: Max acceptable slippage (bps)
- Example: Swap ETH → stETH via best available route

### `enso_bundle`
- Create atomic transaction bundles
- Parameters:
  - `actions`: Array of actions to execute
    - `protocol`: Protocol slug (aave, uniswap)
    - `action`: Action type (deposit, swap, etc)
    - `args`: Action-specific parameters
- Example: [Swap → Deposit → Transfer in one tx]

## Protocol Interaction Actions
### `enso_deposit`
- Standardized deposit across protocols
- Parameters:
  - `protocol`: Target protocol (aave, morpho)
  - `tokenIn`: Input token address
  - `amountIn`: Deposit amount
  - `position`: Target position address

### `enso_withdraw` 
- Unified withdrawal action
- Parameters:
  - `protocol`: Protocol to withdraw from
  - `position`: Position address to exit
  - `amount`: Shares/amount to withdraw

## Advanced Features
### `enso_cross_chain`
- Cross-chain bundle execution
- Parameters:
  - `sourceChain`: Origin chain ID
  - `destChain`: Target chain ID
  - `bridge`: Bridge protocol to use
  - `actions`: Pre/post bridge actions

### `enso_smart_wallet`
- Smart wallet management
- Parameters:
  - `deploy`: Boolean to deploy if needed
  - `batch`: Array of wallet operations
  - `signature`: Permit data

## Utility Actions
### `enso_simulate`
- Simulate transaction bundle
- Parameters:
  - `bundle`: Transaction bundle to test
  - `gasEstimate`: Return gas estimate

### `enso_approvals`
- Batch token approvals
- Parameters:  
  - `tokens`: Array of tokens to approve
  - `spender`: Enso router address

---

**Implementation Notes:**
1. Use Enso's `useOutputOfCallAt` for chaining actions
2. Support both EOA and smart wallet execution contexts
3. Integrate with Enso's Metadata API for protocol data
4. Handle gas optimization automatically
5. Add slippage protection defaults (300 = 3%)

**Example Bundle Payload:**