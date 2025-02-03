import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize ChatOpenAI
const chat = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7
});

// Create the conversation prompt
const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are Sam, a friendly DEFI portfolio advisor. Follow this conversation flow:

1. Start by introducing yourself and asking for the user's name
2. Ask about their DEFI goals (long-term growth, quick gains, balanced strategy)
3. Ask about their prior experience with DEFI
4. Ask about their risk tolerance
5. Summarize their information and confirm

Keep the conversation natural and friendly. Ask one question at a time and wait for responses.
Never skip steps or ask multiple questions at once.`],
  ["human", "{input}"]
]);

// Main conversation loop
const startChat = async () => {
  try {
    let isFirstMessage = true;
    
    while (true) {
      const { input } = await inquirer.prompt([{
        type: 'input',
        name: 'input',
        message: chalk.green('You:'),
        validate: (input) => input.trim() !== '' || 'Please say something.'
      }]);

      // Check for stop command
      if (input.toLowerCase() === 'stop') {
        console.log(chalk.yellow('Goodbye! Have a great day!'));
        break;
      }

      // Get agent's response
      const messages = await prompt.formatMessages([
        ["system", isFirstMessage ? "The user is responding to your introduction. Their name is in their first message. Acknowledge their name and proceed to ask about their DEFI goals." : "Continue the conversation according to the flow."],
        ["human", input]
      ]);
      
      const response = await chat.invoke(messages);
      console.log(chalk.cyan('Sam:', response.content));
      
      isFirstMessage = false;
    }
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error);
  }
};

// Start the chat
startChat(); 