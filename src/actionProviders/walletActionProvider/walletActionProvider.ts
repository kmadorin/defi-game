import { z } from "zod";
import { ActionProvider, Action } from "@coinbase/agentkit";
import { NativeTransferSchema, GetWalletDetailsSchema } from "./schemas";
import { EvmWalletProvider } from "@coinbase/agentkit";
import { parseEther } from "viem";
import Decimal from "decimal.js";

/**
 * WalletActionProvider is a wallet action provider for native transfers.
 */
export class WalletActionProvider extends ActionProvider<EvmWalletProvider> {
	private walletProvider: EvmWalletProvider;

	constructor(walletProvider: EvmWalletProvider) {
		super("test", []);
		this.walletProvider = walletProvider;
	}

	/**
	 * Perform a simple calculation.
	 */
	async getWalletDetails(): Promise<string> {
		try {
			const walletProvider = this.walletProvider;
			const address = walletProvider.getAddress();
			const network = walletProvider.getNetwork();
			const balance = await walletProvider.getBalance();
			const name = walletProvider.getName();

			// Convert balance from Wei to ETH using Decimal for precision
			const ethBalance = new Decimal(balance.toString()).div(new Decimal(10).pow(18));

			return `Wallet Details:
- Provider: ${name}
- Address: ${address}
- Network: 
  * Protocol Family: ${network.protocolFamily}
  * Network ID: ${network.networkId || "N/A"}
  * Chain ID: ${network.chainId || "N/A"}
- ETH Balance: ${ethBalance.toFixed(6)} ETH
- Native Balance: ${balance.toString()} WEI`;
		} catch (error) {
			return `Error getting wallet details: ${error}`;
		}
	}

	/**
	 * Perform a simple calculation.
	 */
	async nativeTransfer(args: z.infer<typeof NativeTransferSchema>): Promise<string> {
		try {
			const result = await this.walletProvider.sendTransaction({
				to: args.to as `0x${string}`,
				value: parseEther(args.value)
			});
			return `Transferred ${args.value} ETH to ${args.to}.\nTransaction hash: ${result}`;
		} catch (error) {
			console.error(error);
			return `Error transferring the asset: ${error}`;
		}
	}

	getActions(): Action[] {
		return [
			{
				name: "native_transfer",
				description: `this tool transfers ETH to another onchain address. It takes the following inputs:
- value: The amount to transfer in whole units e.g. 1 ETH or 0.00001 ETH
- to: The address to receive the funds`,
				schema: NativeTransferSchema,
				invoke: (args) => this.nativeTransfer(args),
			},
			{
				name: "get_wallet_details",
				description: `This tool will return the details of the connected wallet including:
    - Wallet address
    - Network information (protocol family, network ID, chain ID)
    - ETH token balance
    - Native token balance
    - Wallet provider name`,
				schema: GetWalletDetailsSchema,
				invoke: () => this.getWalletDetails(),
			},
		];
	}

	supportsNetwork(): boolean {
		// This test provider supports all networks
		return true;
	}
}

export const walletActionProvider = (walletProvider: EvmWalletProvider) =>
	new WalletActionProvider(walletProvider);
