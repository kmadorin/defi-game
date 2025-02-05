import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StructuredOutputParser } from 'langchain/output_parsers';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { z } from 'zod';
import { writeFileSync } from 'fs';

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
- Use a warm, engaging tone. Gently confirm the client's responses before moving to the next topic.
- Begin naturally by introducing yourself and asking for the client's name.
- Vary your language and transitions; do not repeat the same phrases in every turn.
- As the conversation evolves, gradually build on what the client has already shared.
- When you have enough information, let them know they can type "CREATE_WALLET" to proceed with setting up their wallet.
- When they type CREATE_WALLET, respond with an enthusiastic message about setting up their wallet and getting started.
`;

export async function startOnboarding() {
  const messages = [new SystemMessage(systemPrompt)];
  let messageCount = 0;
  let username = null;
  let defiGoals = null;
  let experience = null;
  let riskTolerance = null;
  let investmentApproach = null;
  let lastUserMessage = '';

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

      lastUserMessage = input; // Store the last user message

      // Allow the user to exit anytime
      if (input.toLowerCase() === 'stop') {
        console.log(chalk.white('Sam') + chalk.cyan(': ' + 'Thank you for chatting with me! Have a great day!'));
        process.exit(0);
      }

      // Append the client's reply to the conversation history
      messages.push(new HumanMessage(input));
      messageCount++;

      // When enough conversation has happened, the client may type "CREATE_WALLET" to finalize
      if (input.trim().toUpperCase() === "CREATE_WALLET") {
        // Extract information from conversation history
        for (const msg of messages) {
          const content = msg.content.toLowerCase();
          
          // Extract username
          if (!username) {
            if (content.includes('my name is') || content.includes('i am')) {
              const nameMatch = content.match(/(?:my name is|i am) (\w+)/);
              if (nameMatch) username = nameMatch[1];
            }
            if (content.includes('nice to meet you')) {
              const nameMatch = content.match(/nice to meet you,? (\w+)/i);
              if (nameMatch) username = nameMatch[1];
            }
          }

          // Extract goals from user messages only
          if (msg instanceof HumanMessage && !defiGoals && 
              (content.includes('invest') || content.includes('goal') || 
               content.includes('looking') || content.includes('start'))) {
            defiGoals = msg.content;
          }

          // Extract experience level
          if (content.includes('beginner') || content.includes('intermediate') || content.includes('expert')) {
            experience = content.includes('beginner') ? 'beginner' : 
                        content.includes('intermediate') ? 'intermediate' : 'expert';
          }

          // Extract risk tolerance and investment approach
          if (content.includes('conservative') || content.includes('moderate') || content.includes('aggressive')) {
            const approach = content.includes('conservative') ? 'conservative' :
                           content.includes('moderate') ? 'moderate' : 'aggressive';
            
            if (!riskTolerance) riskTolerance = approach;
            if (!investmentApproach) investmentApproach = approach;
          }
        }

        const profileData = {
          username: username || "User",
          defiGoals: defiGoals || "Getting started with DeFi",
          experience: experience || "beginner",
          riskTolerance: riskTolerance || "conservative",
          investmentApproach: investmentApproach || "conservative"
        };

        writeFileSync('memory.json', JSON.stringify(profileData, null, 2));
        
        // Send a final message and return profile data immediately
        console.log(chalk.white('Sam') + chalk.cyan(': Perfect! I\'ll help you set up your wallet and get started with DeFi. Let me take care of that for you...'));
        return profileData;
      }

      // Generate Sam's next reply naturally based on the full conversation context
      const response = await chat.invoke(messages);
      console.log(chalk.white('Sam') + chalk.cyan(': ' + response.content));
      messages.push(new AIMessage(response.content));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    throw error;
  }
} 