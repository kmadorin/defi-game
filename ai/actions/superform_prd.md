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

## Implementation Plan

### 1. Schema Definitions

Define input schemas using Zod. (See analogous files under `/aaveActionProvider/schemas.ts`.)
- **DepositSchema:** Validate that `chainId` is a positive integer, `superformId` and `receiver` are valid Ethereum addresses, and `amount` is a valid numeric string. Set `slippage` optional with a default (0.5%).
- **WithdrawSchema:** Validate that `chainId` is a positive integer, `superformId` and `receiver` are valid addresses, and `amount` is an integer-like string.

Example:
```typescript
// File: src/actionProviders/superformActionProvider/schemas.ts
import { z } from "zod";

export const DepositSchema = z.object({
  chainId: z.number().int().positive(),
  superformId: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid number"),
  receiver: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  slippage: z.number().min(0).max(100).optional().default(0.5)
});

export const WithdrawSchema = z.object({
  chainId: z.number().int().positive(),
  superformId: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  amount: z.string().regex(/^\d+$/, "Must be a valid whole number"),
  receiver: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  slippage: z.number().min(0).max(100).optional().default(0.5)
});
```

### 2. Constants

Declare constants for vault address mappings and the Superform ABI. The ABI should include the deposit and withdraw functions with the required parameters.

```typescript
// File: src/actionProviders/superformActionProvider/constants.ts
export const SUPERFORM_VAULTS = {
  8453: { // Example: Base Mainnet
    "eth": "0x3Ae5d4...", 
    "usdc": "0x89205A3..."
  },
  42161: { // Example: Arbitrum
    "eth": "0x1C7D4B1...",
    "usdc": "0x4eb4dB1..."
  }
};

export const SUPERFORM_ABI = [
  "function deposit(uint256 amount, address receiver, uint256 minShares) returns (uint256)",
  "function withdraw(uint256 shares, address receiver, uint256 minAmount) returns (uint256)"
];
```

### 3. Action Provider Class

Structure the Superform action provider similar to Morpho/Aave. Key steps include:

- **Deposit Flow:**
  - Validate parameters (using the schema).
  - Convert `amount` from a human-readable string into atomic units (using functions like `parseEther` or a similar utility).
  - If needed (depending on the implementation), execute an `approve` call for the underlying token.
  - Compute `minShares = amount_atomic * (1 - (slippage/100))` using precise math (e.g., Decimal.js).
  - Encode the deposit function call with `SUPERFORM_ABI` and send the transaction.
  - Wait for receipt and return the result.

- **Withdraw Flow:**
  - Validate parameters.
  - Convert `amount` to the appropriate integer value.
  - Compute `minAmount = shares * (1 - (slippage/100))`.
  - Encode and execute the withdraw function on the vault contract.
  - Return transaction receipt details.

Include network validation against supported chains similar to how MorphoActionProvider does.

### 4. Error Handling

Return clear error messages for:
- Insufficient token balance.
- Slippage exceeding limits.
- Invalid chain ID or vault address.
- Cross-chain withdrawal attempts (if applicable).

## Key Differences from Similar Providers

1. **Cross-chain Support:** Use the `chainId` parameter to resolve vault addresses dynamically.
2. **Slippage Handling:** Calculate minimum accepted shares/amounts using the `slippage` parameter.
3. **Vault Resolution:** Instead of a fixed vault address, use `superformId` from the caller – optionally verify against `SUPERFORM_VAULTS`.
4. **Share-based Withdrawals:** Operations are executed on vault shares rather than raw asset amounts.

## Future Extensions

- **superform_position:** Query a user's current vault positions.
- **superform_migrate:** Support migration of positions between vaults.
- **superform_batch:** Enable batch operations across multiple vaults.
- **Enhanced Cross-chain Operations:** More robust handling of cross-chain deposits/withdrawals.

## Testing Plan

1. **Mainnet Fork Tests:** Validate ETH/USDC deposits and withdrawals on test forks.
2. **Slippage Boundaries:** Test edge cases for slippage values (e.g., 0% and high percentages).
3. **Network Validation:** Ensure rejection of invalid or unsupported chain IDs.
4. **Address Verification:** Validate that all Ethereum addresses pass the regex checks in the schema. 