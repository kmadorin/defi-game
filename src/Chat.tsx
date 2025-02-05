import React from 'react';
import { useEffect } from 'react';
import { WalletDefault } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance, useSwitchChain, createConfig, http } from 'wagmi'
import { ViemWalletProvider } from '@coinbase/agentkit'
import { baseSepolia } from 'wagmi/chains'
import { formatEther } from 'viem'
import { useConnectorClient } from 'wagmi'
import { AgentKit, walletActionProvider, pythActionProvider, wethActionProvider, morphoActionProvider } from '@coinbase/agentkit'
 
const Chat: React.FC = () => {
	const { address } = useAccount()

	const { data: balance } = useBalance({
		address,
	})

	const config = createConfig({ 
		chains: [baseSepolia], 
		transports: { 
			[baseSepolia.id]: http(), 
		}, 
	})

	const response = useConnectorClient({ config })
	console.log("response:", response);
	const {data: walletClient} = response;

	useEffect(() => {
		const createAgentKit = async () => {
			if (walletClient) {
				// const walletProvider = new ViemWalletProvider(walletClient);
				console.log("walletClient:", walletClient);
				
				// const [address] = walletClient.requestAddresses();
				// console.log("address:", address);
				// console.log("walletProvider:", walletProvider);
				// const agentKit = await AgentKit.from({
				// 	walletProvider,
				// 	actionProviders: [walletActionProvider(), pythActionProvider(), wethActionProvider(), morphoActionProvider()]
				// });

				// console.log("agentKit:", agentKit);
			}
		}

		createAgentKit();
	}, [walletClient]);


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

			{/* Chat messages area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				<div className="flex justify-start">
					<div className="bg-white rounded-lg p-3 max-w-xs shadow">
						<p className="text-gray-800">Hello! How are you?</p>
					</div>
				</div>
				<div className="flex justify-end">
					<div className="bg-blue-500 rounded-lg p-3 max-w-xs shadow">
						<p className="text-white">I'm doing great, thanks!</p>
					</div>
				</div>
			</div>

			{/* Input area */}
			<div className="border-t border-gray-200 p-4">
				<div className="flex space-x-2">
					<input
						type="text"
						placeholder="Type a message..."
						className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
					/>
					<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
						Send
					</button>
				</div>
			</div>
		</div>
	);
};

export default Chat;
