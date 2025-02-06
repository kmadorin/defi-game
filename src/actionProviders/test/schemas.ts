import { z } from "zod";

export const TestCalculationSchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number"),
}); 