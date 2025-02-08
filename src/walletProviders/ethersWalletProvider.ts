// TODO: Improve type safety
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Signer, TypedDataDomain, TypedDataField } from "ethers";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import { WalletProvider, Network } from "@coinbase/agentkit";
/**
 * EvmWalletProvider is the abstract base class for all EVM wallet providers.
 *
 * @abstract
 */
export class EthersWalletProvider extends WalletProvider {
  private signer: Signer;

  constructor(signer: Signer) {
    super();
    this.signer = signer;
  }

  /**
   * Sign a message.
   *
   * @param message - The message to sign.
   * @returns The signed message.
   */
  async signMessage(message: string | Uint8Array): Promise<`0x${string}`> {
    return this.signer.signMessage(message) as Promise<`0x${string}`>;
  }

  /**
   * Sign a typed data.
   *
   * @param typedData - The typed data to sign.
   * @returns The signed typed data.
   */
  async signTypedData(typedData: any): Promise<`0x${string}`> {
    const { domain, types, value } = typedData as {
      domain: TypedDataDomain,
      types: Record<string, TypedDataField[]>,
      value: Record<string, any>
    };
    return (this.signer as any).signTypedData(domain, types, value) as Promise<`0x${string}`>;
  }

  /**
   * Sign a transaction.
   *
   * @param transaction - The transaction to sign.
   * @returns The signed transaction.
   */
  async signTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    const tx = await this.signer.populateTransaction(transaction);
    const signedTx = await this.signer.signTransaction(tx);
    return signedTx as `0x${string}`;
  }

  /**
   * Send a transaction.
   *
   * @param transaction - The transaction to send.
   * @returns The transaction hash.
   */
  async sendTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    const response = await this.signer.sendTransaction(transaction);
    return response.hash as `0x${string}`;
  }

  /**
   * Wait for a transaction receipt.
   *
   * @param txHash - The transaction hash.
   * @returns The transaction receipt.
   */
  async waitForTransactionReceipt(txHash: `0x${string}`): Promise<any> {
    if (!this.signer.provider) throw new Error("Signer has no provider");
    return this.signer.provider.waitForTransaction(txHash);
  }

  getName(): string {
    return "Ethers Wallet";
  }

  getAddress(): string {
    return this.signer.getAddress() as unknown as string;
  }

  getNetwork(): Network {
    if (!this.signer.provider) {
      throw new Error("No provider available");
    }
    return {
      protocolFamily: "evm",
      networkId: "mainnet",
      chainId: "1"
    };
  }

  async getBalance(): Promise<bigint> {
    const address = await this.signer.getAddress();
    const balance = await this.signer?.provider?.getBalance(address);
    return BigInt(balance?.toString() ?? "0");
  }

  async nativeTransfer(to: string, value: string): Promise<`0x${string}`> {
    return this.sendTransaction({ to, value });
  }
}