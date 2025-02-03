import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StructuredOutputParser } from 'langchain/output_parsers';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { z } from 'zod';
import { writeFileSync } from 'fs';

dotenv.config();

// Define the schema for the client profile
const UserProfile = z.object({
  username: z.string().describe("The client's name"),
  defiGoals: z.string().describe("Client's aspirations with decentralized finance (e.g. long-term growth, quick gains, or a balanced strategy)"),
  experience: z.enum(['beginner', 'intermediate', 'expert']).describe("Client's level of experience in DEFI"),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).describe("Client's comfort with risk"),
  investmentApproach: z.enum(['conservative', 'balanced', 'aggressive']).describe("Preferred investment style")
});

// Create a StructuredOutputParser instance from the schema
const parser = StructuredOutputParser.fromZodSchema(UserProfile);

// Initialize ChatOpenAI
const chat = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.3
});

// Updated system prompt to guide a natural conversation
const systemPrompt = `
You are Sam, a friendly DEFI portfolio manager having a relaxed conversation with a client. 
Your goal is to gently learn about:
  1. Their name
  2. Their aspirations with investing in decentralized finance (e.g. long-term growth, quick gains, or a balanced strategy)
  3. Their level of experience (beginner, intermediate, or expert)
  4. Their comfort with risk (conservative, moderate, or aggressive)
  5. Their preferred investment style (conservative, balanced, or aggressive)

Guidelines:
- Use a warm, engaging tone. Gently confirm the client's responses (e.g., "Got it, thanks!") before moving to the next topic.
- Begin naturally by introducing yourself and asking for the client's name.
- Vary your language and transitions; do not repeat the same phrases in every turn.
- As the conversation evolves, gradually build on what the client has already shared.
- When you believe you have enough details, ask: "Wonderful, I've got a good picture of your profile. Does everything look correct?" and wait for any corrections.
- Finally, when the client is ready, let them type the command "GENERATE_PROFILE" to finalize.
- When you output the final reply after "GENERATE_PROFILE", include a JSON summary following these format instructions:
${parser.getFormatInstructions()}
`;

const startOnboarding = async () => {
  const messages = [new SystemMessage(systemPrompt)];
  let messageCount = 0;

  try {
    // Get the initial greeting from Sam
    const initialResponse = await chat.invoke(messages);
    console.log(chalk.white('Sam') + chalk.cyan(': ' + initialResponse.content));
    messages.push(new AIMessage(initialResponse.content));

    while (true) {
      // Prompt the client for input
      const { input } = await inquirer.prompt([{
        type: 'input',
        name: 'input',
        message: 'You: ',
        validate: input => input.trim() ? true : 'Please say something.',
      }]);

      // Allow the user to exit anytime
      if (input.toLowerCase() === 'stop') {
        console.log(chalk.white('Sam') + chalk.cyan(': ' + 'Thank you for chatting with me! Have a great day!'));
        process.exit(0);
      }

      // Append the client's reply to the conversation history
      messages.push(new HumanMessage(input));
      messageCount++;

      // When enough conversation has happened, the client may type "GENERATE_PROFILE" to finalize
      if (messageCount >= 8 && input.trim().toUpperCase() === "GENERATE_PROFILE") {
        const finalResponse = await chat.invoke(messages);
        try {
          const parsedData = await parser.parse(finalResponse.content);
          writeFileSync('memory.json', JSON.stringify(parsedData, null, 2));
          console.log(chalk.green('\n✅ Profile saved to memory.json'));
          console.log(chalk.white('Sam') + chalk.cyan(': Wonderful, your profile is complete! Let\'s work together to optimize your strategy.'));
          process.exit(0);
        } catch (parseError) {
          console.error(chalk.red('Parsing error, please review your responses.'), parseError);
          // Reset message count and continue conversation
          messageCount = 0;
        }
      }

      // Generate Sam's next reply naturally based on the full conversation context
      const response = await chat.invoke(messages);
      console.log(chalk.white('Sam') + chalk.cyan(': ' + response.content));
      messages.push(new AIMessage(response.content));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
};

startOnboarding();
