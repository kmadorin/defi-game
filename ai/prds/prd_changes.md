1. I want to use actual wallet for the app based on Coinbase MPC Wallet. Use Coinbase Agentkit docs here: https://docs.cdp.coinbase.com/agentkit/docs/wallet-management to learn how it can be used together with Coinbase MPC Wallet. Also, check these docs [text](https://docs.cdp.coinbase.com/agentkit/docs/quickstart) and this is quickstart for MPC wallet: [text](https://docs.cdp.coinbase.com/wallet-api/docs/quickstart) Update the @prd_aggregated.md based on this

2. For this version MVP I want onboarding mode to be implemented and investment mode just to be in menu, but not implemented.

3. Let's skip basename registration for now.

4. Let's skip faucet topup also.

5. Let's skip daily report for now.

6. Skip strategy suggestion for now.

7. MPC wallet API keys should be stored in .env file

8. All interactions with an app should be via a dialogue with Portfolio Manager, including requests like show balance, send 0.0001 ETH to 0x0000000000000000000000000000000000000000, swap ETH to USDC, show me my wallet address, show me my portfolio. Let's limit the user requests to these. Agentkit should be used to build this agent. It should use actions from Agentkit to perform these requests.

9. Base testnet should be used. Here is it's RPC endpoint if needed: [text](https://api.developer.coinbase.com/rpc/v1/base-sepolia/kNI0M0LbTjx7vBycGDfkkQcTH7pX2CEj)

10. For getting user's wallet balances we can use cdp_listBalances from Coinbase API. Description is here: [text](https://docs.cdp.coinbase.com/cdp-apis/reference/cdp_listbalances)
