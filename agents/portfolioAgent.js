import { HumanMessage } from "@langchain/core/messages";
import { AgentKit, CdpWalletProvider, walletActionProvider } from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import inquirer from 'inquirer';
import fs from 'fs';

const WALLET_DATA_FILE = "wallet_data.txt";

// Validate environment variables
function validateEnvironment() {
  const missingVars = [];
  const requiredVars = ["OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE"];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("❌ Error: Required environment variables are not set");
    missingVars.forEach(varName => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    throw new Error("Missing required environment variables");
  }

  if (!process.env.NETWORK_ID) {
    console.warn("⚠️ Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
  }
}

export async function initializePortfolioAgent(profile) {
  try {
    validateEnvironment();

    // Read existing wallet data if available
    let walletDataStr = null;
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("⚠️ Error reading wallet data:", error);
      }
    }

    // Format the private key correctly
    const privateKey = process.env.CDP_API_KEY_PRIVATE
      ?.replace(/\\n/g, '\n')
      ?.replace(/["']/g, '');

    // Initialize AgentKit with wallet data
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME?.trim(),
      apiKeyPrivateKey: privateKey,
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID?.trim() || "base-sepolia"
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);
    const agentKit = await AgentKit.from({ 
      walletProvider,
      actionProviders: [walletActionProvider()]
    });

    // Setup LangChain agent
    const tools = await getLangChainTools(agentKit);
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.5
    });

    // Save wallet data
    const exportedWallet = await walletProvider.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
    
    // Create agent configuration
    const agentConfig = { 
      configurable: { 
        thread_id: `Portfolio-${profile.username}-${Date.now()}` 
      } 
    };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm: model,
      tools,
      messageModifier: `
        You are a DeFi educational assistant focused on helping users learn about:
        - Basic DeFi concepts
        - Portfolio management
        
        For balance checks, use the wallet action provider to show real balances.
        Provide simple, clear explanations suitable for beginners.
      `
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error('❌ Failed to initialize portfolio agent:', error);
    throw error;
  }
}

export async function runPortfolioAgent({ agent, config }) {
  const commands = {
    'balance': 'Check your wallet balance',
    'send': 'Send tokens to another address',
    'receive': 'Get your wallet address to receive tokens',
    'history': 'View your transaction history',
    'help': 'Show all available commands',
    'quit': 'Exit the app'
  };

  function showHelp() {
    console.log('\n💡 Available commands:');
    Object.entries(commands).forEach(([cmd, desc]) => {
      console.log(`- "${cmd}" - ${desc}`);
    });
    console.log('\nYou can also ask me any questions about DeFi concepts!\n');
  }

  // Show initial welcome message with wallet address
  try {
    const walletData = JSON.parse(fs.readFileSync(WALLET_DATA_FILE, 'utf8'));
    console.log('\n🎉 Welcome to your DeFi Portfolio Manager!');
    console.log('Your wallet has been created successfully.');
    console.log(`\n📬 Your wallet address: ${walletData.address}`);
    if (process.env.NETWORK_ID) {
      console.log(`🌐 Network: ${process.env.NETWORK_ID}`);
    }
    showHelp();
  } catch (error) {
    console.error('❌ Error reading wallet data:', error);
    showHelp();
  }

  while (true) {
    try {
      const { message } = await inquirer.prompt([{
        type: 'input',
        name: 'message',
        message: '💬 You:',
        validate: input => input.trim() ? true : 'Please say something.',
      }]);

      const command = message.toLowerCase();

      if (command === 'quit') {
        console.log('\n👋 Goodbye! Thanks for using the DeFi portfolio manager!');
        return;
      }

      if (command === 'help') {
        showHelp();
        continue;
      }

      if (command === 'receive') {
        try {
          const walletData = JSON.parse(fs.readFileSync(WALLET_DATA_FILE, 'utf8'));
          console.log(`\n📬 Your wallet address: ${walletData.address}`);
          continue;
        } catch (error) {
          console.error('❌ Error reading wallet address:', error);
        }
      }

      const stream = await agent.stream({ messages: [new HumanMessage(message)] }, config);
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log('\n🤖 Assistant:', chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
      }
    } catch (error) {
      if (error.response?.status >= 500) {
        console.error('❌ Server error. Please try again later.');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  }
} 