# Superform Action Provider PRD

## Core Actions

### 1. superform_deposit
**Description**: Deposit assets into a Superform vault.

**Parameters**:
- `chainId`  
  The chain ID where the vault exists (e.g. 8453). Used to verify that we deploy the correct transaction on the supported network.
- `superformId`  
  The Superform vault contract address.
- `amount`  
  The deposit amount expressed in token decimals (as a string). This value will be converted to atomic units.
- `receiver`  
  Address to receive the Superform shares.
- `slippage`  
  Maximum acceptable slippage (e.g. 0.5 means 0.5%). Used to compute minimum accepted output (minShares) by applying:  
  `minShares = amount_atomic * (1 - (slippage/100))`
- `tokenAddress`  
  The address of the underlying token being deposited (needed for approvals).

**Transaction Flow**:
1. Validate chain ID against supported networks
2. Convert amount to atomic units using appropriate decimals
3. Calculate minShares using slippage
4. Approve vault to spend tokens
5. Execute deposit transaction
6. Wait for receipt and validate success

### 2. superform_withdraw
**Description**: Withdraw assets from a Superform vault.

**Parameters**:
- `chainId`  
  Chain ID where the vault exists.
- `superformId`  
  The Superform vault contract address.
- `amount`  
  The number of vault shares to redeem (in vault decimals).
- `receiver`  
  Address to receive the underlying assets.
- `slippage`  
  Maximum acceptable slippage applied to the output (minAmount = shares * (1 - (slippage/100)))

**Transaction Flow**:
1. Validate chain ID and vault address
2. Calculate minAmount using slippage
3. Execute withdraw transaction
4. Wait for receipt and validate success

## Implementation Plan

### 1. Schema Definitions

```typescript
// File: src/actionProviders/superformActionProvider/schemas.ts
import { z } from "zod";

export const DepositSchema = z.object({
  chainId: z.number().int().positive()
    .describe("The chain ID where the vault exists"),
  superformId: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address")
    .describe("The Superform vault contract address"),
  amount: z.string()
    .regex(/^\d+(\.\d+)?$/, "Must be a valid number")
    .describe("Amount to deposit in token decimals"),
  receiver: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .describe("Address to receive Superform shares"),
  slippage: z.number()
    .min(0)
    .max(100)
    .optional()
    .default(0.5)
    .describe("Maximum acceptable slippage (0.5 = 0.5%)"),
  tokenAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid token address")
    .describe("Address of token being deposited")
}).describe("Input schema for Superform deposit action");

export const WithdrawSchema = z.object({
  chainId: z.number().int().positive()
    .describe("The chain ID where the vault exists"),
  superformId: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address")
    .describe("The Superform vault contract address"),
  amount: z.string()
    .regex(/^\d+$/, "Must be a valid whole number")
    .describe("Number of shares to redeem"),
  receiver: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .describe("Address to receive underlying assets"),
  slippage: z.number()
    .min(0)
    .max(100)
    .optional()
    .default(0.5)
    .describe("Maximum acceptable slippage (0.5 = 0.5%)")
}).describe("Input schema for Superform withdraw action");
```

### 2. Constants and Network Support

```typescript
// File: src/actionProviders/superformActionProvider/constants.ts
export const SUPPORTED_NETWORKS = {
  "base-mainnet": 8453,
  "arbitrum": 42161,
  // Add other supported networks
};

export const SUPERFORM_ABI = [
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "minShares", type: "uint256" }
    ],
    name: "deposit",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "minAmount", type: "uint256" }
    ],
    name: "withdraw",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const SUPERFORM_VAULTS = {
  8453: { // Base
    "eth": "0x...",
    "usdc": "0x..."
  },
  42161: { // Arbitrum
    "eth": "0x...",
    "usdc": "0x..."
  }
};
```

### 3. Action Provider Implementation

Key components:

**Constructor and Setup**:
```typescript
export class SuperformActionProvider extends ActionProvider<EvmWalletProvider> {
  private walletProvider: EvmWalletProvider;

  constructor(walletProvider: EvmWalletProvider) {
    super("superform", []);
    this.walletProvider = walletProvider;
  }
}
```

**Deposit Implementation**:
```typescript
async deposit(args: z.infer<typeof DepositSchema>): Promise<string> {
  // 1. Validate network
  if (!this.supportsNetwork(args.chainId)) {
    return `Error: Chain ID ${args.chainId} not supported`;
  }

  // 2. Convert amount and calculate minShares
  const atomicAmount = parseUnits(args.amount, decimals);
  const slippageFactor = new Decimal(1).minus(new Decimal(args.slippage).div(100));
  const minShares = atomicAmount * BigInt(slippageFactor.toFixed(0));

  // 3. Approve spending
  const approvalResult = await approve(
    this.walletProvider,
    args.tokenAddress,
    args.superformId,
    atomicAmount
  );

  // 4. Execute deposit
  const data = encodeFunctionData({
    abi: SUPERFORM_ABI,
    functionName: "deposit",
    args: [atomicAmount, args.receiver, minShares]
  });

  // 5. Send transaction and handle result
  try {
    const txHash = await this.walletProvider.sendTransaction({
      to: args.superformId,
      data
    });
    const receipt = await this.walletProvider.waitForTransactionReceipt(txHash);
    return `Successfully deposited ${args.amount} into Superform vault`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}
```

### 4. Error Handling

Detailed error cases to handle:

1. **Network Validation**:
   - Unsupported chain ID
   - Wrong network connected
   - Network connection issues

2. **Transaction Failures**:
   - Insufficient balance
   - Approval failure
   - Slippage exceeded
   - Contract reverts
   - Gas estimation failures

3. **Input Validation**:
   - Invalid addresses
   - Invalid amounts
   - Decimal precision errors
   - Missing required parameters

4. **State Validation**:
   - Vault paused/frozen
   - Deposit/withdraw limits exceeded
   - Invalid token approvals

### 5. Action Registration

```typescript
getActions(): Action[] {
  return [
    {
      name: "superform_deposit",
      description: `Deposits assets into a Superform vault.

Required parameters:
- chainId: The chain ID where the vault exists (e.g. 8453)
- superformId: The Superform vault contract address
- amount: Amount to deposit in token decimals
- receiver: Address to receive shares
- slippage: Maximum acceptable slippage (default 0.5%)
- tokenAddress: Address of token being deposited

Important:
- Amounts should be in human-readable format (e.g. "1.5" ETH)
- Slippage is in percentage points (0.5 = 0.5%)
- Ensure sufficient balance and approval before deposit`,
      schema: DepositSchema,
      invoke: (args) => this.deposit(args)
    },
    {
      name: "superform_withdraw",
      description: `Withdraws assets from a Superform vault.

Required parameters:
- chainId: The chain ID where the vault exists
- superformId: The Superform vault contract address
- amount: Number of shares to redeem
- receiver: Address to receive assets
- slippage: Maximum acceptable slippage (default 0.5%)

Important:
- Amount should be in share units
- Ensure sufficient share balance before withdrawal`,
      schema: WithdrawSchema,
      invoke: (args) => this.withdraw(args)
    }
  ];
}
```

## Testing Plan

1. **Unit Tests**:
   - Schema validation
   - Slippage calculations
   - Network support checks
   - Error message formats

2. **Integration Tests**:
   - Mainnet fork tests for each supported network
   - Full deposit/withdraw flows
   - Error case simulations
   - Gas estimation checks

3. **E2E Tests**:
   - Complete user flows on testnets
   - Cross-chain operations if supported
   - UI integration verification

4. **Security Tests**:
   - Input sanitization
   - Transaction safety checks
   - Approval handling
   - Slippage protection