import React from 'react';
import { useEffect } from 'react';
import { WalletDefault } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance, useSwitchChain, useWalletClient, useChainId } from 'wagmi'
import { ViemWalletProvider } from '@coinbase/agentkit'
import { formatEther } from 'viem'
import { AgentKit, pythActionProvider, wethActionProvider } from '@coinbase/agentkit'
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { walletActionProvider } from './actionProviders/walletActionProvider';
import { morphoActionProvider } from './actionProviders/morphoActionProvider';
// Define the exact same Zod schema as CLI version
const UserProfile = z.object({
	username: z.string().describe("The client's name"),
	defiGoals: z.string().describe("Client's aspirations with decentralized finance"),
	experience: z.enum(['beginner', 'intermediate', 'expert']).describe("Client's level of experience in DEFI"),
	riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).describe("Client's comfort with risk"),
});

const parser = StructuredOutputParser.fromZodSchema(UserProfile);

// Same system prompt as CLI version
const onboardingSystemPrompt = `
You are Sam, a friendly DEFI portfolio manager having a relaxed conversation with a client. 
Your goal is to gently learn about:
  1. Their name
  2. Their aspirations with investing in decentralized finance
  3. Their level of experience (beginner, intermediate, or expert)
  4. Their comfort with risk (conservative, moderate, or aggressive)

Guidelines:
- Use a warm, engaging tone. Gently confirm the client's responses before moving to the next topic.
- Begin naturally by introducing yourself and asking for the client's name.
- Vary your language and transitions; do not repeat the same phrases in every turn.
- As the conversation evolves, gradually build on what the client has already shared.
- When you have enough information, let them know they can type "CREATE_WALLET" to proceed.
`;

const createChatModel = (modelName: string, temperature: number) => new ChatOpenAI({
	modelName,
	temperature,
	streaming: true,
	maxTokens: 300,
	apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY
});

const initializeOnboardingAgent = async () => {
	if (!import.meta.env.VITE_PUBLIC_OPENAI_API_KEY) {
		console.error('OPENAI_API_KEY is missing');
		return null;
	}

	const model = createChatModel("gpt-4-turbo-preview", 0.3);

	const messages = [new SystemMessage(onboardingSystemPrompt)];

	// Get initial greeting from Sam and add to messages
	const initialResponse = await model.invoke(messages);
	messages.push(initialResponse); // Add AI's first message to history

	return {
		agent: model,
		messages: messages, // Now includes system prompt + initial AI response
		initialMessage: initialResponse.content
	};
};

const MEMORY_FILE = "defiProfile";

// Add portfolio system prompt matching CLI version
const PORTFOLIO_SYSTEM_PROMPT = `
You are a DeFi educational assistant focused on helping users learn about:
- Basic DeFi concepts
- Portfolio management
- Wallet balances using real-time data
- Token transactions
Provide simple, clear explanations suitable for beginners. Always check balances using wallet actions when asked about funds.
`;

const Chat: React.FC = () => {
	const { address } = useAccount()

	const { data: balance } = useBalance({
		address,
	})

	const chainId = useChainId()
	
	const response = useWalletClient({chainId: chainId})
	const { data: walletClient } = response;


	const [inputMessage, setInputMessage] = React.useState('');
	const [messages, setMessages] = React.useState<Array<{ content: string, isUser: boolean }>>([]);
	const [agent, setAgent] = React.useState<any>(null);
	const [agentConfig] = React.useState({
		configurable: {
			thread_id: `chat-${Date.now()}`
		}
	});
	const [userProfile, setUserProfile] = React.useState<z.infer<typeof UserProfile> | null>(null);
	const [currentAgent, setCurrentAgent] = React.useState<'onboarding' | 'portfolio'>('onboarding');
	const [agentMessages, setAgentMessages] = React.useState<Array<SystemMessage | HumanMessage | AIMessage>>([]);

	useEffect(() => {
		const initializeChat = async () => {
			const savedProfile = localStorage.getItem('defiProfile');

			if (savedProfile) {
				const profile = JSON.parse(savedProfile);
				setMessages([{
					content: `Welcome ${profile.username}! Your DeFi portfolio manager is ready.`,
					isUser: false
				}, {
					content: "Ask about balances, transactions, or DeFi concepts:",
					isUser: false
				}]);
				setUserProfile(profile);
			} else {
				const onboardingSetup = await initializeOnboardingAgent();
				if (onboardingSetup) {
					setAgent(onboardingSetup.agent);
					setAgentMessages(onboardingSetup.messages);
					// Only set initial message once
					const initialContent = Array.isArray(onboardingSetup.initialMessage)
						? onboardingSetup.initialMessage[0].type === 'text'
							? onboardingSetup.initialMessage[0].text
							: ''
						: onboardingSetup.initialMessage;
					setMessages([{ content: initialContent, isUser: false }]);
				}
			}
		};

		initializeChat();
	}, []);

	// Update the profile change useEffect to handle proper agent switching
	useEffect(() => {
		const initializePortfolioManager = async () => {
			if (!userProfile || !walletClient) return;

			try {
				// Clear previous chat history but keep last message
				setMessages(prev => [
					{
						content: `🎉 Welcome ${userProfile.username}! Your DeFi portfolio manager is ready.`,
						isUser: false
					}
				]);

				// Re-initialize agent with fresh config
				const walletProvider = new ViemWalletProvider(walletClient);
				const agentKit = await AgentKit.from({
					walletProvider,
					actionProviders: [pythActionProvider(), wethActionProvider(), morphoActionProvider(walletProvider), walletActionProvider(walletProvider)]
				});

				const tools = await getLangChainTools(agentKit);
				const model = createChatModel("gpt-3.5-turbo", 0.5);

				const reactAgent = createReactAgent({
					llm: model,
					tools,
					messageModifier: PORTFOLIO_SYSTEM_PROMPT
				});

				// Force agent update and clear message history
				setAgent(() => reactAgent);
				setCurrentAgent('portfolio');

				// Add fresh prompt after initialization
				setMessages(prev => [
					...prev,
					{
						content: "Ask about balances, transactions, or DeFi concepts:",
						isUser: false
					}
				]);

			} catch (error) {
				console.error('Portfolio init failed:', error);
				setMessages(prev => [
					...prev,
					{ content: 'Failed to initialize portfolio manager', isUser: false }
				]);
			}
		};

		initializePortfolioManager();
	}, [userProfile, walletClient]);

	const handleSend = async () => {
		const trimmedInput = inputMessage.trim();
		if (!trimmedInput || !agent) return;

		// Create a new HumanMessage for the user's input
		const newHumanMessage = new HumanMessage(trimmedInput);
		const updatedAgentMessages = [...agentMessages, newHumanMessage];
		setAgentMessages(updatedAgentMessages);

		// Add user message ONLY ONCE
		setMessages((prev) => [...prev, { content: trimmedInput, isUser: true }]);
		setInputMessage('');

		try {
			if (currentAgent === 'portfolio') {
				const stream = await agent.stream(
					{ messages: [new HumanMessage(trimmedInput)] },
					{
						configurable: {
							thread_id: agentConfig.configurable.thread_id,
							profile: userProfile,
							address: address
						}
					}
				);

				// Initialize an empty message for the AI response
				setMessages(prev => [...prev, { content: '', isUser: false }]);

				let fullResponse = '';
				for await (const chunk of stream) {
					console.log("chunk", chunk);
					if ("agent" in chunk) {
						fullResponse += chunk.agent.messages[0].content;
						// Update the last message with accumulated response
						setMessages(prev => [
							...prev.slice(0, -1),
							{ content: fullResponse, isUser: false }
						]);
					}
				}
			} else {
				// Invoke the onboarding agent with the full conversation history
				const response = await agent.invoke(updatedAgentMessages);
				const aiMsgItem = new AIMessage(response.content);
				setAgentMessages((prev) => [...prev, aiMsgItem]);
				setMessages((prev) => [
					...prev,
					{ content: response.content, isUser: false }
				]);

				// If user commands wallet creation, delegate to the LLM for profile extraction
				if (trimmedInput.toUpperCase() === 'CREATE_WALLET') {
					try {
						// Get format instructions
						const formatInstructions = parser.getFormatInstructions();

						// Request structured data from the model
						const structuredResponse = await agent.invoke([
							...agentMessages,
							new HumanMessage(
								"Based on our conversation, please provide a JSON summary of my profile following these instructions:\n" +
								formatInstructions
							)
						]);

						const contentString = Array.isArray(structuredResponse.content)
							? structuredResponse.content[0].type === 'text'
								? structuredResponse.content[0].text
								: ''
							: structuredResponse.content;

						const parsed = await parser.parse(contentString);

						localStorage.setItem(MEMORY_FILE, JSON.stringify(parsed));
						setUserProfile(parsed);

						setAgentMessages([]);
						setMessages([{
							content: "🚀 Configuring your portfolio manager...",
							isUser: false
						}]);

					} catch (error) {
						console.error('Profile extraction failed:', error);
						// Get parser requirements to guide user
						const formatInstructions = parser.getFormatInstructions();
						setMessages(prev => [
							...prev,
							{
								content: `I need to confirm your details:\n${formatInstructions}\nPlease answer the remaining questions.`,
								isUser: false
							}
						]);
					}
					return;
				}
			}
		} catch (error) {
			console.error('Agent error:', error);
			setMessages((prev) => [
				...prev,
				{ content: 'Error processing request', isUser: false }
			]);
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
