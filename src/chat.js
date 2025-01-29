import inquirer from 'inquirer'
import chalk from 'chalk'
import { PortfolioManager } from './agent.js'
import dotenv from 'dotenv'

dotenv.config()

// Clear console and show header
function clearAndShowHeader() {
  console.clear()
  console.log(chalk.blue.bold('🤖 DeFi Portfolio Manager'))
  console.log(chalk.cyan(`
👋 Hi! I'm your DeFi portfolio manager.
I'll help you create and manage your wallet.
  `))
}

// Handle exit
function handleExit() {
  console.log(chalk.yellow('\n👋 Goodbye!'))
  process.exit(0)
}

async function main() {
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(chalk.red('Error: ANTHROPIC_API_KEY not found in .env file'))
    process.exit(1)
  }
  
  const manager = new PortfolioManager(process.env.ANTHROPIC_API_KEY)
  let pendingTxId = 0
  
  // Clear console and show header
  clearAndShowHeader()

  // Signal handlers
  process.on('SIGINT', handleExit)
  process.on('SIGTERM', handleExit)

  // Main chat loop
  while(true) {
    try {
      const { message } = await inquirer.prompt({
        type: 'input',
        name: 'message',
        message: chalk.green('You:'),
        prefix: '💬'
      })
      
      // Check for exit
      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        handleExit()
      }

      // Process message and handle confirmations
      const response = await manager.processMessage(message)
      
      // Skip further processing if response is null (confirmation was handled)
      if (response === null) {
        continue
      }
      
      // If response indicates a pending transaction, store it
      if (response?.needsConfirmation && response.rawTx) {
        manager.pendingTransactions.set(pendingTxId++, {
          rawTx: response.rawTx,
          timestamp: Date.now()
        })
      }

    } catch (error) {
      if (error.isTtyError) {
        // Terminal error, likely due to restart
        continue
      }
      console.error(chalk.red('❌ Error:'), error.message)
    }
  }
}

// Start the application
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
}) 