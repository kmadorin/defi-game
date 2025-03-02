"use client"
import { useState, useEffect } from "react"
import { Message } from "@/components/chat/Message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { useAccount, useWalletClient, useChainId } from 'wagmi'
import { ViemWalletProvider } from '@coinbase/agentkit'
import { AgentKit, pythActionProvider, wethActionProvider } from '@coinbase/agentkit'
import { getLangChainTools } from '@coinbase/agentkit-langchain'
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages"
import { StructuredOutputParser } from "langchain/output_parsers"
import { z } from "zod"
import { walletActionProvider } from '../../actionProviders/walletActionProvider'
import { morphoActionProvider } from '../../actionProviders/morphoActionProvider'

type OnboardingAgent = ChatOpenAI;
type PortfolioAgent = ReturnType<typeof createReactAgent>;
type Agent = OnboardingAgent | PortfolioAgent | null;

// Define UserProfile schema
const UserProfile = z.object({
  username: z.string().describe("The client's name"),
  defiGoals: z.string().describe("Client's aspirations with decentralized finance"),
  experience: z.enum(['beginner', 'intermediate', 'expert']).describe("Client's level of experience in DEFI"),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).describe("Client's comfort with risk"),
});

const parser = StructuredOutputParser.fromZodSchema(UserProfile);

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

const PORTFOLIO_SYSTEM_PROMPT = `
You are a DeFi educational assistant focused on helping users learn about:
- Basic DeFi concepts
- Portfolio management
- Wallet balances using real-time data
- Token transactions
Provide simple, clear explanations suitable for beginners. Always check balances using wallet actions when asked about funds.
`;

const MEMORY_FILE = "defiProfile";

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
  const initialResponse = await model.invoke(messages);
  messages.push(initialResponse);

  return {
    agent: model,
    messages: messages,
    initialMessage: initialResponse.content
  };
};

export function ChatInterface() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient({ chainId })

  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ content: string, isBot: boolean, actions?: string[] }>>([])
  const [agent, setAgent] = useState<Agent>(null)
  const [agentConfig] = useState({
    configurable: {
      thread_id: `chat-${Date.now()}`
    }
  })
  const [userProfile, setUserProfile] = useState<z.infer<typeof UserProfile> | null>(null)
  const [currentAgent, setCurrentAgent] = useState<'onboarding' | 'portfolio'>('onboarding')
  const [agentMessages, setAgentMessages] = useState<Array<SystemMessage | HumanMessage | AIMessage>>([])

  useEffect(() => {
    const initializeChat = async () => {
      const savedProfile = localStorage.getItem(MEMORY_FILE);

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setMessages([{
          content: `Welcome ${profile.username}! Your DeFi portfolio manager is ready.`,
          isBot: true
        }, {
          content: "Ask about balances, transactions, or DeFi concepts:",
          isBot: true
        }]);
        setUserProfile(profile);
      } else {
        const onboardingSetup = await initializeOnboardingAgent();
        if (onboardingSetup) {
          setAgent(onboardingSetup.agent);
          setAgentMessages(onboardingSetup.messages);
          const initialContent = Array.isArray(onboardingSetup.initialMessage)
            ? onboardingSetup.initialMessage[0].type === 'text'
              ? onboardingSetup.initialMessage[0].text
              : ''
            : onboardingSetup.initialMessage;
          setMessages([{ content: initialContent, isBot: true }]);
        }
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    const initializePortfolioManager = async () => {
      if (!userProfile || !walletClient) return;

      try {
        setMessages(() => [{
          content: `🎉 Welcome ${userProfile.username}! Your DeFi portfolio manager is ready.`,
          isBot: true
        }]);

        const walletProvider = new ViemWalletProvider(walletClient);
        
        // Verify wallet provider is properly initialized
        if (!walletProvider || !walletProvider.getAddress()) {
          throw new Error('Failed to initialize wallet provider');
        }

        const agentKit = await AgentKit.from({
          walletProvider,
          actionProviders: [
            pythActionProvider(), 
            wethActionProvider(), 
            morphoActionProvider(walletProvider), 
            walletActionProvider(walletProvider)
          ]
        });

        // Verify agent kit initialization
        if (!agentKit) {
          throw new Error('Failed to initialize agent kit');
        }

        const tools = await getLangChainTools(agentKit);
        
        // Verify tools initialization
        if (!tools || tools.length === 0) {
          throw new Error('Failed to initialize agent tools');
        }

        const model = createChatModel("gpt-3.5-turbo", 0.5);

        const reactAgent = createReactAgent({
          llm: model,
          tools,
          messageModifier: PORTFOLIO_SYSTEM_PROMPT
        });

        // Verify agent creation
        if (!reactAgent) {
          throw new Error('Failed to create portfolio agent');
        }

        // Test agent capabilities
        try {
          await reactAgent.stream(
            { messages: [new HumanMessage("test")] },
            { configurable: { thread_id: agentConfig.configurable.thread_id } }
          );
        } catch (error) {
          console.error('Agent test failed:', error);
          throw new Error('Portfolio agent validation failed');
        }

        setAgent(() => reactAgent);
        setCurrentAgent('portfolio');

        setMessages(prev => [
          ...prev,
          {
            content: "Ask about balances, transactions, or DeFi concepts:",
            isBot: true
          }
        ]);

      } catch (error: Error | unknown) {
        console.error('Portfolio init failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setMessages(prev => [
          ...prev,
          { 
            content: `Failed to initialize portfolio manager: ${errorMessage}. Please try again or contact support.`, 
            isBot: true 
          }
        ]);
        // Reset state on failure
        setAgent(null);
        setCurrentAgent('onboarding');
      }
    };

    initializePortfolioManager();
  }, [userProfile, walletClient, agentConfig.configurable.thread_id]);

  const handleSend = async () => {
    const trimmedInput = inputMessage.trim();
    if (!trimmedInput || !agent) return;

    const newHumanMessage = new HumanMessage(trimmedInput);
    const updatedAgentMessages = [...agentMessages, newHumanMessage];
    setAgentMessages(updatedAgentMessages);

    setMessages((prev) => [...prev, { content: trimmedInput, isBot: false }]);
    setInputMessage('');

    try {
      if (currentAgent === 'portfolio' && 'stream' in agent) {
        const portfolioAgent = agent as PortfolioAgent;
        const stream = await portfolioAgent.stream(
          { messages: [new HumanMessage(trimmedInput)] },
          {
            configurable: {
              thread_id: agentConfig.configurable.thread_id,
              profile: userProfile,
              address: address
            }
          }
        );

        let toolData = '';
        let fullResponse = '';
        let messageCreated = false;
        
        for await (const chunk of stream) {
          if ("tools" in chunk) {
            const toolContent = typeof chunk.tools.messages[0].content === 'string'
              ? chunk.tools.messages[0].content
              : '';
            if (toolContent) {
              toolData = toolContent;
            }
          } 
          if ("agent" in chunk) {
            const content = Array.isArray(chunk.agent.messages[0].content)
              ? chunk.agent.messages[0].content.find((c: { type: string; text: string }) => c.type === 'text')?.text || ''
              : chunk.agent.messages[0].content || '';
            
            if (content) {  // Only proceed if we have actual content
              if (!messageCreated) {
                setMessages(prev => [...prev, { content, isBot: true }]);
                messageCreated = true;
              } else {
                setMessages(prev => [
                  ...prev.slice(0, -1),
                  { content: fullResponse + content, isBot: true }
                ]);
              }
              fullResponse += content;
            }
          }
        }
      } else {
        const onboardingAgent = agent as OnboardingAgent;
        const response = await onboardingAgent.invoke(updatedAgentMessages);
        const responseContent = typeof response.content === 'string' 
          ? response.content 
          : Array.isArray(response.content) && response.content[0]?.type === 'text' 
            ? response.content[0].text 
            : '';
            
        const aiMsgItem = new AIMessage(responseContent);
        setAgentMessages((prev) => [...prev, aiMsgItem]);
        setMessages((prev) => [
          ...prev,
          { content: responseContent, isBot: true }
        ]);

        if (trimmedInput.toUpperCase() === 'CREATE_WALLET') {
          try {
            const formatInstructions = parser.getFormatInstructions();
            const structuredResponse = await onboardingAgent.invoke([
              ...agentMessages,
              new HumanMessage(
                "Based on our conversation, please provide a JSON summary of my profile following these instructions:\n" +
                formatInstructions
              )
            ]);

            const contentString = typeof structuredResponse.content === 'string'
              ? structuredResponse.content
              : Array.isArray(structuredResponse.content) && structuredResponse.content[0]?.type === 'text'
                ? structuredResponse.content[0].text
                : '';

            const parsed = await parser.parse(contentString);
            localStorage.setItem(MEMORY_FILE, JSON.stringify(parsed));
            setUserProfile(parsed);

            setAgentMessages([]);
            setMessages([{
              content: "🚀 Configuring your portfolio manager...",
              isBot: true
            }]);
          } catch (error: Error | unknown) {
            console.error('Profile extraction failed:', error);
            const formatInstructions = parser.getFormatInstructions();
            setMessages(prev => [
              ...prev,
              {
                content: `I need to confirm your details:\n${formatInstructions}\nPlease answer the remaining questions.`,
                isBot: true
              }
            ]);
          }
        }
      }
    } catch (error: Error | unknown) {
      console.error('Agent error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error processing request';
      setMessages((prev) => [
        ...prev,
        { content: errorMessage, isBot: true }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 overflow-y-auto space-y-6 !pt-14 md:!pt-6">
        {messages.map((message, i) => (
          <Message key={i} isBot={message.isBot} actions={message.actions}>
            {message.content}
          </Message>
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-4 max-w-2xl mx-auto">
          <Input 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message" 
            className="text-sm h-10 border-border" 
          />
          <Button 
            size="icon" 
            className="h-10 w-10 bg-black hover:bg-black/90"
            onClick={handleSend}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

