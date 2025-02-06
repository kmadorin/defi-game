import React from 'react';
import { useEffect } from 'react';
import { WalletDefault } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance, useSwitchChain, createConfig, http } from 'wagmi'
import { ViemWalletProvider } from '@coinbase/agentkit'
import { formatEther } from 'viem'
import { useConnectorClient } from 'wagmi'
import { AgentKit, walletActionProvider, pythActionProvider, wethActionProvider, morphoActionProvider } from '@coinbase/agentkit'
import { WalletClient } from 'viem'
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

const Chat: React.FC = () => {
	const { address } = useAccount()

	const { data: balance } = useBalance({
		address,
	})

	const response = useConnectorClient()
	const {data: walletClient} = response;

	const [inputMessage, setInputMessage] = React.useState('');
	const [messages, setMessages] = React.useState<Array<{content: string, isUser: boolean}>>([]);
	const [agent, setAgent] = React.useState<any>(null);
	const [agentConfig] = React.useState({
		configurable: {
			thread_id: `chat-${Date.now()}`
		}
	});

	useEffect(() => {
		const initializeAgent = async () => {
			if (!import.meta.env.VITE_PUBLIC_OPENAI_API_KEY) {
				console.error('OPENAI_API_KEY is missing from environment variables');
				return;
			}
			
			if (walletClient && address) {
				const walletProvider = new ViemWalletProvider(walletClient as unknown as WalletClient);
				const agentKit = await AgentKit.from({
					walletProvider,
					actionProviders: [walletActionProvider(), pythActionProvider(), wethActionProvider(), morphoActionProvider()]
				});

				// Initialize LangChain
				const tools = await getLangChainTools(agentKit);
				const model = new ChatOpenAI({
					modelName: "gpt-3.5-turbo",
					temperature: 0.5,
					apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
				});

				const reactAgent = createReactAgent({
					llm: model,
					tools,
					messageModifier: `
						You are a DeFi educational assistant. Help users with:
						- Wallet balances
						- Token transactions
						- DeFi concepts
						- Portfolio management
						Provide clear, beginner-friendly explanations.
					`
				});

				setAgent(reactAgent);
			}
		};

		initializeAgent();
	}, [walletClient, address]);

	const handleSend = async () => {
		if (!inputMessage.trim() || !agent) return;

		// Add user message
		setMessages(prev => [...prev, { content: inputMessage, isUser: true }]);
		setInputMessage('');

		try {
			const stream = await agent.stream({ 
				messages: [new HumanMessage(inputMessage)] 
			}, agentConfig);

			let agentResponse = '';
			for await (const chunk of stream) {
				if ("agent" in chunk) {
					agentResponse = chunk.agent.messages[0].content;
					setMessages(prev => [...prev.slice(0, -1), { content: agentResponse, isUser: false }]);
				}
			}
		} catch (error) {
			console.error('Agent error:', error);
			setMessages(prev => [...prev, { content: 'Error processing request', isUser: false }]);
		}
	};

	const { chains, switchChain } = useSwitchChain()

	return (
		<div className="flex flex-col h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-blue-600 p-4 text-white flex justify-between items-center">
				<h1 className="text-xl font-bold">Chat App</h1>
				<div>
					{chains.map((chain) => (
						<button key={chain.id} onClick={() => switchChain({ chainId: chain.id })}>
							{chain.name}
						</button>
					))}
					Balance: {formatEther(balance?.value ?? 0n)}
					<WalletDefault />
				</div>
			</header>

			{/* Updated messages area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((msg, i) => (
					<div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
						<div className={`${msg.isUser ? 'bg-blue-500' : 'bg-white'} rounded-lg p-3 max-w-xs shadow`}>
							<p className={msg.isUser ? 'text-white' : 'text-gray-800'}>{msg.content}</p>
						</div>
					</div>
				))}
			</div>

			{/* Updated input area */}
			<div className="border-t border-gray-200 p-4">
				<div className="flex space-x-2">
					<input
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && handleSend()}
						type="text"
						placeholder="Ask about DeFi or your wallet..."
						className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
					/>
					<button 
						onClick={handleSend}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
};

export default Chat;
