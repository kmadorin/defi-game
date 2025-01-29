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

// Basic agent tools
const tools = {
	getBalance: async ({ address }) => {
		try {
			const { publicClient } = createClients(process.env.PRIVATE_KEY)
			const balance = await getBalance(address, publicClient)
			return { balance: balance.toString() }
		} catch (error) {
			throw error
		}
	},

	createWallet: async () => {
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
	},

	prepareSendTransaction: async ({ to, valueInEth }) => {
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

// Main agent class
export class PortfolioManager {
	constructor(apiKey) {
		this.claude = new Anthropic({ apiKey })
		this.tools = tools
		this.memory = []
		this.pendingTransactions = new Map() // Track pending confirmations
		this.transactionTimeout = 300_000 // 5 minutes
	}

	isConfirmationResponse(message) {
		return this.pendingTransactions.size > 0 && /^(да|yes|y|нет|no|n)/i.test(message)
	}

	async handleTransactionConfirmation(message) {
		const pendingTx = Array.from(this.pendingTransactions.values())[0]
		if (!pendingTx) return null

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

	async processMessage(message) {
		try {
			// Check for pending tx first
			if (this.isConfirmationResponse(message)) {
				const response = await this.handleTransactionConfirmation(message)
				if (response) {
					printChat(response, 'assistant')
					return response
				}
				return null
			}

			this.memory.push(`User: ${message}`)

			const toolsList = [{
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
				description: "Prepare transaction to send ETH. Example: 'Send 0.1 ETH to address 0x...'",
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

			const response = await this.claude.messages.create({
				model: "claude-3-sonnet-20240229",
				max_tokens: 1024,
				system: `You are a DeFi Portfolio Manager. Help users manage their crypto wallet.
When createWallet returns status "existing", just inform user that they already have a wallet and show its address.
When user asks about wallet balance, use getBalance tool. If no address is specified, it will show balance for user's wallet.
Be concise and direct in your responses. Never show or mention private keys in your response.`,
				messages: [{ role: 'user', content: message }],
				tools: toolsList
			});

			const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');

			if (toolUseBlocks.length > 0) {
				const results = await this.executeTools(toolUseBlocks);

				// If this is a transaction that needs confirmation, return the full result
				if (results[0]?.result?.needsConfirmation) {
					printChat(results[0].result.message, 'assistant');
					return results[0].result;
				}

				const followUpResponse = await this.claude.messages.create({
					model: "claude-3-sonnet-20240229",
					max_tokens: 1024,
					system: `You are a DeFi Portfolio Manager. Help users manage their crypto wallet.
When createWallet returns status "existing", just inform user that they already have a wallet and show its address.
When user asks about wallet balance, use getBalance tool. If no address is specified, it will show balance for user's wallet.
Be concise and direct in your responses. Never show or mention private keys in your response.`,
					messages: [
						{ role: 'user', content: message },
						{
							role: 'assistant',
							content: [{
								type: 'tool_use',
								id: toolUseBlocks[0].id,
								name: toolUseBlocks[0].name,
								input: toolUseBlocks[0].input
							}]
						},
						{
							role: 'user',
							content: [{
								type: 'tool_result',
								tool_use_id: toolUseBlocks[0].id,
								content: JSON.stringify(results[0].result)
							}]
						}
					],
					tools: toolsList
				});

				const textBlocks = followUpResponse.content.filter(block => block.type === 'text');
				if (textBlocks.length > 0) {
					const responseText = textBlocks[0].text;
					printChat(responseText, 'assistant');
					return responseText;
				}
			} else {
				const textBlocks = response.content.filter(block => block.type === 'text');
				if (textBlocks.length > 0) {
					const responseText = textBlocks[0].text;
					printChat(responseText, 'assistant');
					return responseText;
				}
			}

			throw new Error('No valid response content found');

		} catch (error) {
			const errorMessage = `An error occurred while processing request: ${error.message}. Please try again.`;
			printChat(errorMessage, 'assistant');
			return errorMessage;
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
} 