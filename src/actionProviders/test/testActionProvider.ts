import { z } from "zod";
import { ActionProvider, Action, Network } from "@coinbase/agentkit";
import { NativeTransferSchema } from "./schemas";
import { EvmWalletProvider } from "@coinbase/agentkit";
import { parseEther } from "viem";
/**
 * TestActionProvider is a simple action provider for testing purposes.
 */
export class TestActionProvider extends ActionProvider<EvmWalletProvider> {
  private walletProvider: EvmWalletProvider;

  constructor(walletProvider: EvmWalletProvider) {
    super("test", []);
    this.walletProvider = walletProvider;
  }

  /**
   * Perform a simple calculation.
   */
  async nativeTransfer(args: z.infer<typeof NativeTransferSchema>): Promise<string> {
    console.log("nativeTransfer", args);
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
        name: "send_test_transaction",
        description: `this tool transfers ETH to another onchain address. It takes the following inputs:
- value: The amount to transfer in whole units e.g. 1 ETH or 0.00001 ETH
- to: The address to receive the funds`,
        schema: NativeTransferSchema,
        invoke: (args) => this.nativeTransfer(args),
      },
    ];
  }

  supportsNetwork(_: Network): boolean {
    // This test provider supports all networks
    return true;
  }
}

export const testActionProvider = (walletProvider: EvmWalletProvider) => 
  new TestActionProvider(walletProvider); 
 