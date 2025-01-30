import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk'
import { createClients, getBalance, generatePrivateKey, prepareSendTransaction, simulateTransactionWithAlchemy, signAndSendRawTransaction } from './blockchain.js'
import * as fs from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

// Function to print chat messages
function printChat(message, role) {
	if (role === 'user') {
		console.log(chalk.cyan(`💬 You: ${message}`));
	} else if (role === 'assistant') {
		console.log(chalk.cyan(`🤖 Manager: ${message}`));
	}
}

// Add explicit error classes for better error handling
class AgentError extends Error {
	constructor(message, context = {}) {
		super(message);
		this.name = 'AgentError';
		this.context = context;
	}
}

class TransactionError extends AgentError {
	constructor(message, transactionData) {
		super(message, { transactionData });
		this.name = 'TransactionError';
	}
}

// Split tools into separate class for better organization
class AgentTools {
	constructor() {
		this.registeredTools = {
			getBalance: this.handleGetBalance,
			createWallet: this.handleCreateWallet,
			prepareSendTransaction: this.handlePrepareTransaction
		};
	}

	async handleGetBalance({ address }) {
		try {
			const { publicClient } = createClients(process.env.PRIVATE_KEY);
			return { balance: (await getBalance(address, publicClient)).toString() };
		} catch (error) {
			throw new AgentError('Balance check failed', { address, error });
		}
	}

	async handleCreateWallet() {
		try {
			// Check existing private key in .env
			let privateKey = process.env.PRIVATE_KEY;
			let envContent = '';
			let isNewWallet = false;

			try {
				envContent = await fs.readFile('.env', 'utf-8');
			} catch (error) {
				if (error.code === 'ENOENT') {
					envContent = 'ANTHROPIC_API_KEY=' + process.env.ANTHROPIC_API_KEY + '\n';
				} else {
					return {
						error: 'Could not read .env file: ' + error.message
					};
				}
			}

			// If private key doesn't exist or is invalid, create new one
			if (!privateKey || !privateKey.startsWith('0x')) {
				privateKey = generatePrivateKey();
				isNewWallet = true;

				// Remove old PRIVATE_KEY entry if exists
				const envLines = envContent.split('\n').filter(line => !line.startsWith('PRIVATE_KEY='));

				// Add new private key
				envLines.push(`PRIVATE_KEY=${privateKey}`);
				const newContent = envLines.join('\n');

				try {
					// Write updated file
					await fs.writeFile('.env', newContent);
					// Update process.env
					process.env.PRIVATE_KEY = privateKey;
				} catch (error) {
					return {
						error: 'Could not save private key: ' + error.message
					};
				}
			}

			// Create account from private key
			const { account } = createClients(privateKey);

			// Return result with status info
			return {
				address: account.address,
				status: isNewWallet ? 'created' : 'existing',
				message: isNewWallet
					? 'New wallet created'
					: 'Using existing wallet'
			};

		} catch (error) {
			return {
				error: 'Could not create/get wallet: ' + error.message
			};
		}
	}

	async handlePrepareTransaction({ to, valueInEth }) {
		try {
			const { walletClient, account } = createClients(process.env.PRIVATE_KEY)

			// 1. Prepare tx
			const prepResult = await prepareSendTransaction(walletClient, to, valueInEth)
			if (prepResult.error) {
				return { error: prepResult.error }
			}

			// 2. Simulate
			const simResult = await simulateTransactionWithAlchemy({
				from: account.address,
				to: to,
				value: prepResult.rawTx.value,
				data: prepResult.rawTx.data
			})
			if (simResult.error) {
				return { error: simResult.error }
			}

			// Format simulation results
			const humanReadableSimulation = `
📊 Simulation Results:
- From: ${account.address}
- To: ${to}
- Amount: ${valueInEth} ETH
- Gas: ${simResult.result.gasEstimate || 'N/A'}
- Balance Changes: ${simResult.result.balanceChanges || 'N/A'}
			`

			// Convert BigInt values to strings for storage
			const serializedTx = {
				...prepResult.rawTx,
				value: prepResult.rawTx.value.toString(),
				gas: prepResult.rawTx.gas?.toString(),
				maxFeePerGas: prepResult.rawTx.maxFeePerGas?.toString(),
				maxPriorityFeePerGas: prepResult.rawTx.maxPriorityFeePerGas?.toString()
			}

			return {
				simulation: humanReadableSimulation,
				rawTx: serializedTx,
				needsConfirmation: true,
				message: `${humanReadableSimulation}\n\nConfirm transaction (yes/no):`
			}
		} catch (error) {
			return { error: `Transaction preparation error: ${error.message}` }
		}
	}
}

// Main agent class refactored with clearer method organization
export class PortfolioManager {
	constructor(apiKey) {
		this.claude = new Anthropic({ apiKey });
		this.tools = new AgentTools().registeredTools;
		this.memory = [];
		this.pendingTransactions = new Map();
		this.transactionTimeout = 300_000;
		
		// Centralized system prompt
		this.systemPrompt = `You are a DeFi Portfolio Manager. Help users manage their crypto wallet.
			When createWallet returns status "existing", inform user they have a wallet and show address.
			Use getBalance when asked about balances. Never reveal private keys.`;
	}

	isConfirmationResponse(message) {
		return this.pendingTransactions.size > 0 && /^(да|yes|y|нет|no|n)/i.test(message)
	}

	async handleTransactionConfirmation(message) {
		const pendingTx = Array.from(this.pendingTransactions.values())[0]
		if (!pendingTx?.rawTx) return null  // Add check for rawTx

		if (/^(да|yes|y)/i.test(message)) {
			const { walletClient } = createClients(process.env.PRIVATE_KEY)
			const result = await signAndSendRawTransaction(walletClient, pendingTx.rawTx)
			this.pendingTransactions.clear()

			if (result.error) {
				return `❌ Transaction error: ${result.error}`
			}
			return `✅ Transaction sent! Hash: ${result.hash}`
		}

		this.pendingTransactions.clear()
		return "❌ Transaction cancelled"
	}

	// Add method to store transaction
	storePendingTransaction(transaction) {
		this.pendingTransactions.clear() // Clear any old transactions
		this.pendingTransactions.set(0, {
			rawTx: transaction,
			timestamp: Date.now()
		})
	}

	// Extract complex logic into separate methods
	async handleToolResponse(toolResults) {
		const firstResult = toolResults[0]?.result;
		
		if (firstResult?.needsConfirmation) {
			printChat(firstResult.message, 'assistant');
			return firstResult;
		}

		return this.generateFollowUpResponse(toolResults);
	}

	async generateFollowUpResponse(toolResults) {
		const followUpResponse = await this.claude.messages.create({
			model: "claude-3-sonnet-20240229",
			max_tokens: 1024,
			system: this.systemPrompt,
			messages: [
				{ 
					role: 'assistant',
					content: [{
						type: 'tool_use',
						id: 'tool_1',
						name: toolResults[0].tool,
						input: toolResults[0].parameters
					}]
				},
				{
					role: 'user',
					content: [{
						type: 'tool_result',
						tool_use_id: 'tool_1',
						content: JSON.stringify(toolResults[0].result)
					}]
				}
			],
			tools: this.getToolsConfig()
		});

		const textBlocks = followUpResponse.content.filter(block => block.type === 'text');
		if (textBlocks.length > 0) {
			const responseText = textBlocks[0].text;
			printChat(responseText, 'assistant');
			return responseText;
		}
		throw new Error('No valid response content found');
	}

	// Simplified main processing flow
	async processMessage(message) {
		if (this.isConfirmationResponse(message)) {
			const response = await this.handleTransactionConfirmation(message);
			if (response) {
				printChat(response, 'assistant');
			}
			return response;
		}

		this.memory.push(`User: ${message}`);
		
		try {
			const response = await this.claude.messages.create({
				model: "claude-3-sonnet-20240229",
				max_tokens: 1024,
				system: this.systemPrompt,
				messages: [{ role: 'user', content: message }],
				tools: this.getToolsConfig()
			});

			const toolCalls = response.content.filter(block => block.type === 'tool_use');
			return toolCalls.length > 0 
				? this.handleToolsFlow(message, toolCalls)
				: this.handleTextResponse(response);
		} catch (error) {
			return this.handleProcessingError(error);
		}
	}

	buildContext() {
		return this.memory.slice(-5).join('\n')
	}

	async executeTools(toolCalls) {
		const results = []

		for (const call of toolCalls) {
			try {
				const tool = this.tools[call.name]
				if (!tool) {
					throw new Error(`Unknown tool: ${call.name}`)
				}

				const result = await tool(call.input)
				results.push({
					tool: call.name,
					parameters: call.input,
					result
				})
			} catch (error) {
				results.push({
					tool: call.name,
					parameters: call.input,
					error: error.message
				})
			}
		}

		return results
	}

	handleProcessingError(error) {
		const errorMessage = `An error occurred while processing request: ${error.message}. Please try again.`;
		printChat(errorMessage, 'assistant');
		return errorMessage;
	}

	getToolsConfig() {
		return [{
			name: "getBalance",
			description: "Get wallet balance (defaults to your own)",
			input_schema: {
				type: "object",
				properties: {
					address: {
						type: "string",
						description: "Wallet address (optional)"
					}
				},
				required: []
			}
		}, {
			name: "prepareSendTransaction",
			description: "Prepare transaction to send ETH",
			input_schema: {
				type: "object",
				properties: {
					to: {
						type: "string",
						description: "Recipient address"
					},
					valueInEth: {
						type: "string",
						description: "Amount of ETH to send (in 0.00 format)"
					}
				},
				required: ["to", "valueInEth"]
			}
		}, {
			name: "createWallet",
			description: "Creates a new wallet or returns existing one",
			input_schema: {
				type: "object",
				properties: {},
				required: []
			}
		}];
	}

	async handleToolsFlow(message, toolCalls) {
		const results = await this.executeTools(toolCalls);
		return this.handleToolResponse(results);
	}

	handleTextResponse(response) {
		const textBlocks = response.content.filter(block => block.type === 'text');
		if (textBlocks.length > 0) {
			const responseText = textBlocks[0].text;
			printChat(responseText, 'assistant');
			return responseText;
		}
		throw new Error('No valid response content found');
	}
} 