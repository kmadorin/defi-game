import { z } from "zod";
import { ActionProvider, Action, Network } from "@coinbase/agentkit";
import { TestCalculationSchema } from "./schemas";

/**
 * TestActionProvider is a simple action provider for testing purposes.
 */
export class TestActionProvider extends ActionProvider {
  constructor() {
    super("test", []);
  }

  /**
   * Perform a simple calculation.
   */
  async calculate(args: z.infer<typeof TestCalculationSchema>): Promise<string> {
    const sum = args.a + args.b;
    return `The sum of ${args.a} and ${args.b} is ${sum}`;
  }

  getActions(): Action[] {
    return [
      {
        name: "calculate",
        description: "Perform a simple calculation",
        schema: TestCalculationSchema,
        invoke: (args) => this.calculate(args),
      },
    ];
  }

  supportsNetwork(_: Network): boolean {
    // This test provider supports all networks
    return true;
  }
}

export const testActionProvider = () => new TestActionProvider(); 