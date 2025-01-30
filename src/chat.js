import inquirer from 'inquirer'
import chalk from 'chalk'
import { PortfolioManager } from './agent.js'
import dotenv from 'dotenv'

dotenv.config()

// Add dedicated UI component for better separation
class ChatInterface {
  static async getInput() {
    const { message } = await inquirer.prompt({
      type: 'input',
      name: 'message',
      message: chalk.green('You:'),
      prefix: '💬'
    });
    return message.trim();
  }

  static showWelcome() {
    console.clear();
    console.log(chalk.blue.bold('🤖 DeFi Portfolio Manager'));
    console.log(chalk.cyan(`
👋 Hi! I'm your DeFi portfolio manager.
I'll help you create and manage your wallet.
    `));
  }
}

// Transaction manager for state handling
class TransactionManager {
  constructor() {
    this.pendingTransactions = new Map();
    this.transactionId = 0;
  }

  addTransaction(transaction) {
    const txId = this.transactionId++;
    this.pendingTransactions.set(txId, {
      ...transaction,
      timestamp: Date.now()
    });
    return txId;
  }
}

// Add missing handlers
function setupExitHandlers() {
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

function handleChatError(error) {
  console.error(chalk.red('Error:'), error.message);
}

function handleExit() {
  console.log(chalk.yellow('\n👋 Goodbye!'));
  process.exit(0);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(chalk.red('Error: ANTHROPIC_API_KEY not found in .env'));
    process.exit(1);
  }

  const manager = new PortfolioManager(process.env.ANTHROPIC_API_KEY);
  const txManager = new TransactionManager();
  
  ChatInterface.showWelcome();
  setupExitHandlers();

  while(true) {
    try {
      const message = await ChatInterface.getInput();
      if (['exit', 'quit'].includes(message.toLowerCase())) handleExit();
      
      const response = await manager.processMessage(message);
      if (!response) continue;

      if (response?.needsConfirmation) {
        txManager.addTransaction(response.rawTx);
        manager.storePendingTransaction(response.rawTx);
      }
    } catch (error) {
      handleChatError(error);
    }
  }
}

// Start the application
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
}); 