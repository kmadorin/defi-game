DEFI Copilot

One-liner:
DEFI Copilot is a Gamified DEFI Portfolio Management chat app

Overview:

DEFI Copilot allows to onboard user into DEFI in a gamified way. In the beginning the user gets a chat with his personal portfolio manager (implemented as an AI agent), which onboards him to the app, learns user's goals and motivation, stores it in memory. He also should learn that two modes are available and choose from which to start: 

1. Onboarding mode. Helps the user to learn about DEFI and different protocols, without any risks. Instead of mainnet, the user will have testnet account or an account in the forked network. Also he'll be able to topup his wallet via faucet. For working with forked network we will use Tenderly Virtual Testnets.

2. Investment mode. The user can start investing his own money in DEFI protocols. All operations are on mainnet and involve real money. In this case a user can top up a wallet via Coinbase onramp with credit card or he can top up his wallet from another wallet with a sum he founds comfortable to risk or invest.

A user chooses the mode during onboarding dialogue with Portfolio Manager agent.

The mode is counted in portfolio manager's system prompt and and it answers to the user based on the mode.

After choosing the mode, Portfolio Manager suggests a user to create a wallet, then base username, and ways to top up a wallet.

Then he top ups his wallet via faucet in onboarding mode or via Coinbase onramp/from another wallet in investment mode.

After that a user can start interact with Portfolio Manager using its tools to learn about DEFI, different protocols, and strategies, etc.

Also he can ask portfolio manager to help him to choose a protocl/strategy based on his goal and risk tolerance. For example, he might be interested to have the best yield that is possible for USDC in different protocols. Portfolio manager agent will use its tools to find the best options and suggest it to a user.

Then user chooses one or several and agent prepares a transaction, simulates it and shows to user an outcome of the transaction to make a decision. A user can acceprt it or reject and continue the dialogue. For simulation we will use Alchemy API or Tenderly API.

Also, a user can set regular tasks for Portfolio Manager, for example to send him a daily report about his portfolio, how much he earned, how each strategy performes. For this we will use theGraph or Covalent APIs to get historical blockchain data.

For creating Portfolio Manager agent we will use Coinbase Agentkit framework, which is based on LangChain framework. 

For managing user's wallet we will use Coinbase MPC wallet or Coinbase Smart Wallet.

For interacting with blockchain we will use Coinbase MPC Wallet






