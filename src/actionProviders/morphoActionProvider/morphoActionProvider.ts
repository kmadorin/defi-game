import { z } from "zod";
import { ActionProvider, Action, Network } from "@coinbase/agentkit";
import { DepositSchema } from "./schemas";
import { Decimal } from "decimal.js";
import { EvmWalletProvider } from "@coinbase/agentkit";
import { parseEther, encodeFunctionData } from "viem";
import { approve } from "../utils";
import { METAMORPHO_ABI } from "./constants";

export const SUPPORTED_NETWORKS = ["base-mainnet", "base-sepolia"];

/**
 *  MorphoActionProvider is an action provider for Morpho Vault interactions.
 */
export class MorphoActionProvider extends ActionProvider<EvmWalletProvider> {
  private walletProvider: EvmWalletProvider;

  constructor(walletProvider: EvmWalletProvider) {
    super("test", []);
    this.walletProvider = walletProvider;
  }

  /**
   * Perform a simple calculation.
   */
  async deposit(args: z.infer<typeof DepositSchema>): Promise<string> {
		const assets = new Decimal(args.assets);

		const wallet = this.walletProvider;

		if (assets.comparedTo(new Decimal(0.0)) != 1) {
      return "Error: Assets amount must be greater than 0";
    }

    try {
      const atomicAssets = parseEther(args.assets);

      const approvalResult = await approve(
        wallet,
        args.tokenAddress,
        args.vaultAddress,
        atomicAssets,
      );

			console.log('approvalResult', approvalResult)
      if (approvalResult.startsWith("Error")) {
        return `Error approving Morpho Vault as spender: ${approvalResult}`;
      }

      const data = encodeFunctionData({
        abi: METAMORPHO_ABI,
        functionName: "deposit",
        args: [atomicAssets, args.receiver],
      });

      const txHash = await wallet.sendTransaction({
        to: args.vaultAddress as `0x${string}`,
        data,
      });

      const receipt = await wallet.waitForTransactionReceipt(txHash);

			console.log('receipt', receipt)

      return `Deposited ${args.assets} to Morpho Vault ${args.vaultAddress} with transaction hash: ${txHash}\nTransaction receipt: ${
        JSON.stringify(receipt, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      }`;
    } catch (error) {
			console.log('error', error)
      return `Error depositing to Morpho Vault: ${error}`;
    }
  }

  getActions(): Action[] {
    return [
      {
        name: "morpho_deposit",
        description: `This tool allows depositing assets into a Morpho Vault. 

It takes:
- vaultAddress: The address of the Morpho Vault to deposit to
- assets: The amount of assets to deposit in whole units
  Examples for WETH:
  - 1 WETH
  - 0.1 WETH
  - 0.01 WETH
- receiver: The address to receive the shares
- tokenAddress: The address of the token to approve

Important notes:
- Make sure to use the exact amount provided. Do not convert units for assets for this action.
- Please use a token address (example 0x4200000000000000000000000000000000000006) for the tokenAddress field.`,
        schema: DepositSchema,
        invoke: (args) => this.deposit(args),
      },
    ];
  }

  /**
   * Checks if the Morpho action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the Morpho action provider supports the network, false otherwise.
   */
  supportsNetwork = (network: Network) =>
    network.protocolFamily === "evm" && SUPPORTED_NETWORKS.includes(network.networkId!);
}

export const morphoActionProvider = (walletProvider: EvmWalletProvider) => 
  new MorphoActionProvider(walletProvider); 
 