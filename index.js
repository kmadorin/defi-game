import 'dotenv/config';
import inquirer from 'inquirer';
import { HumanMessage } from "@langchain/core/messages";
import { AgentKit, CdpWalletProvider, walletActionProvider } from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

const sessionState = {
  username: null,
  mode: null,
  agent: null
};

async function promptUsername() {
  const { username } = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: '👋 Welcome! What should I call you?',
      validate: input => input.length > 0 || 'Username is required'
    }
  ]);
  sessionState.username = username;
}

async function promptMode() {
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '🎮 Select Mode:',
      choices: [
        { name: 'Onboarding (Test/Sandbox)', value: 'onboarding' },
        { name: 'Investment (Simulated)', value: 'investment' }
      ]
    }
  ]);
  sessionState.mode = mode;
}

async function initializeAgent() {
  try {
    // Initialize AgentKit
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivate: process.env.CDP_API_KEY_PRIVATE?.replace(/\\n/g, "\n"),
      networkId: "base-sepolia"
    };
    
    const walletProvider = await CdpWalletProvider.configureWithWallet(config);
    const agentKit = await AgentKit.from({ 
      walletProvider,
      actionProviders: [walletActionProvider()]
    });

    // Setup LangChain agent
    const tools = await getLangChainTools(agentKit);
    const llm = new ChatOpenAI({ model: "gpt-4" });
    
    return createReactAgent({
      llm,
      tools,
      messageModifier: `
        You are a DeFi educational assistant focused on helping users learn about:
        - Basic DeFi concepts
        - Portfolio management
        
        For balance checks, use the wallet action provider to show real balances.
        Provide simple, clear explanations suitable for beginners.
      `
    });
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw error;
  }
}

async function runChatMode(agent) {
  console.log('\n💡 Available commands:');
  console.log('- "balance" - Check your wallet balance');
  console.log('- "quit" - Exit the app\n');

  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: '💬 You:',
        validate: input => input.length > 0 || 'Message is required'
      }
    ]);

    if (message.toLowerCase() === 'quit') {
      console.log(`\n👋 Goodbye, ${sessionState.username}!`);
      return;
    }

    try {
      const response = await agent.invoke({
        messages: [new HumanMessage(message)]
      });

      // Fix: Access the AI message content directly
      const aiMessage = response.messages[response.messages.length - 1];
      console.log('\n🤖 Assistant:', aiMessage.content);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Initializing DeFi Copilot...');
    
    await promptMode();
    await promptUsername();
    
    sessionState.agent = await initializeAgent();
    await runChatMode(sessionState.agent);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main(); 