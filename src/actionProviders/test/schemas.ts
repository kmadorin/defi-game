import { z } from "zod";

export const TestCalculationSchema = z.object({
  // a: z.number().describe("First number"),
  // b: z.number().describe("Second number"),
}); 

/**
 * Input schema for native transfer action.
 */
export const NativeTransferSchema = z
  .object({
    to: z.string().describe("The destination address to receive the funds, e.g. 0x1234567890123456789012345678901234567890"),
    value: z.string().describe("The amount to transfer in whole units e.g. 1 ETH or 0.00001 ETH"),
  })
  .strip()
  .describe("Instructions for transferring native tokens");