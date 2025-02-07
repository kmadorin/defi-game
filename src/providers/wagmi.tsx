import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { base } from 'wagmi/chains'; // add baseSepolia for testing
import { coinbaseWallet } from 'wagmi/connectors';
import { defineChain } from 'viem'

const blockExplorers = {
	default: {
		name: 'baseVirtualTestnet',
		url: 'https://dashboard.tenderly.co/explorer/vnet/5efdef5a-44b7-4e01-b029-4e33777b2952',
	}
}

const rpcUrls = {
	default: {
		http: ['https://virtual.base.rpc.tenderly.co/5efdef5a-44b7-4e01-b029-4e33777b2952'],
	}
}
export const baseVirtualTestnet = defineChain({ ...base, rpcUrls, name: "baseVirtualTestnet", blockExplorers })


export function getConfig() {
	
	return createConfig({
		chains: [baseVirtualTestnet], // add baseSepolia for testing
		connectors: [
			coinbaseWallet({
				appName: "OnchainKit",
				preference: 'smartWalletOnly',
				version: '4',
			}),
		],
		storage: createStorage({
			storage: cookieStorage,
		}),
		ssr: true,
		transports: {
			[base.id]: http('https://virtual.base.rpc.tenderly.co/5efdef5a-44b7-4e01-b029-4e33777b2952'), // add baseSepolia for testing
		},
	});
}

declare module 'wagmi' {
	interface Register {
		config: ReturnType<typeof getConfig>;
	}
}