import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk'
import { createClients, getBalance, sendTransaction, generatePrivateKey } from './blockchain.js'
import * as fs from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

// Функция для вывода сообщений чата
function printChat(message, role) {
	if (role === 'user') {
		console.log(chalk.cyan(`💬 Вы: ${message}`));
	} else if (role === 'assistant') {
		console.log(chalk.cyan(`🤖 Менеджер: ${message}`));
	}
}

// Базовые инструменты агента
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

	sendTransaction: async ({ to, value }) => {
		try {
			const { walletClient } = createClients(process.env.PRIVATE_KEY)
			const hash = await sendTransaction(walletClient, to, value)
			return { hash }
		} catch (error) {
			throw error
		}
	},

	createWallet: async () => {
		try {
			// Проверяем существующий приватный ключ в .env
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
						error: 'Не удалось прочитать файл .env: ' + error.message
					};
				}
			}

			// Если приватного ключа нет или он невалидный, создаем новый
			if (!privateKey || !privateKey.startsWith('0x')) {
				privateKey = generatePrivateKey();
				isNewWallet = true;
				
				// Удаляем старую запись PRIVATE_KEY если она есть
				const envLines = envContent.split('\n').filter(line => !line.startsWith('PRIVATE_KEY='));
				
				// Добавляем новый приватный ключ
				envLines.push(`PRIVATE_KEY=${privateKey}`);
				const newContent = envLines.join('\n');
				
				try {
					// Записываем обновленный файл
					await fs.writeFile('.env', newContent);
					// Обновляем process.env
					process.env.PRIVATE_KEY = privateKey;
				} catch (error) {
					return {
						error: 'Не удалось сохранить приватный ключ: ' + error.message
					};
				}
			}

			// Создаем аккаунт из приватного ключа
			const { account } = createClients(privateKey);
			
			// Возвращаем результат с информацией о статусе
			return {
				address: account.address,
				status: isNewWallet ? 'created' : 'existing',
				message: isNewWallet 
					? 'Создан новый кошелек' 
					: 'Использован существующий кошелек'
			};
			
		} catch (error) {
			return {
				error: 'Не удалось создать/получить кошелек: ' + error.message
			};
		}
	}
}

// Основной класс агента
export class PortfolioManager {
	constructor(apiKey) {
		this.claude = new Anthropic({ apiKey })
		this.tools = tools
		this.memory = []
	}

	async processMessage(message) {
		try {
			this.memory.push(`User: ${message}`)
			
			const toolsList = [{
				name: "getBalance",
				description: "Получить баланс кошелька (по умолчанию ваш собственный)",
				input_schema: {
					type: "object",
					properties: {
						address: {
							type: "string",
							description: "Адрес кошелька (необязательно)"
						}
					},
					required: []
				}
			}, {
				name: "prepareSendTransaction",
				description: "Подготовить транзакцию для отправки ETH. Пример: 'Отправить 0.1 ETH на адрес 0x...'",
				input_schema: {
					type: "object",
					properties: {
						to: {
							type: "string",
							description: "Адрес получателя"
						},
						valueInEth: {
							type: "string",
							description: "Количество ETH для отправки (в формате 0.00)"
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
				system: `You are a DeFi Portfolio Manager. Help users manage their crypto wallet. Communicate in Russian.
When createWallet returns status "existing", just inform user that they already have a wallet and show its address.
When user asks about wallet balance, use getBalance tool. If no address is specified, it will show balance for user's wallet.
Be concise and direct in your responses. Never show or mention private keys in your response.`,
				messages: [{ role: 'user', content: message }],
				tools: toolsList
			});

			// console.log('Got response from Claude');
			//console.log('Full response:', JSON.stringify(response, null, 2));

			const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
			
			if (toolUseBlocks.length > 0) {
				const results = await this.executeTools(toolUseBlocks);
				console.log('Tool results:', results);
				
				const followUpResponse = await this.claude.messages.create({
					model: "claude-3-sonnet-20240229",
					max_tokens: 1024,
					system: `You are a DeFi Portfolio Manager. Help users manage their crypto wallet. Communicate in Russian.
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
			console.error('Error in processMessage:', error);
			const errorMessage = `Произошла ошибка при обработке запроса: ${error.message}. Пожалуйста, попробуйте еще раз.`;
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