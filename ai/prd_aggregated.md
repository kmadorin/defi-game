# DEFI Copilot MVP Product Requirements Document (Aggregated)

## 1. Overview

**Product:** DEFI Copilot  
**Description:**  
A conversational DEFI portfolio management CLI app that integrates the real Coinbase MPC Wallet via Agentkit. Users interact with a Portfolio Manager agent to perform wallet operations on a base testnet. Actions include checking balance, sending ETH, swapping tokens, displaying wallet address, and showing portfolio details – all executed by Agentkit.

**Core Objective:**  
Deliver a one-day MVP using Node.js that integrates Coinbase MPC Wallet functionality in an operational onboarding mode (using testnet), while presenting a non-functional investment mode in the menu.

---

## 2. MVP Goals & Use-Cases

- **Conversational Chat Interface:**  
  - Provide a natural, sequential CLI conversation through dialogue with a Portfolio Manager agent.

- **Mode Selection:**  
  - **Onboarding Mode (Implemented):**  
    - Integrate with Coinbase MPC Wallet using Agentkit for real wallet operations on Base testnet.
    - User setup includes entering a username, with wallet connectivity configured via API keys in a `.env` file.
  - **Investment Mode (Placeholder):**  
    - Shown in the menu but not implemented for this MVP.

- **Wallet Integration & Management:**  
  - Use Coinbase MPC Wallet (via Agentkit) instead of a simulated wallet.
  - API keys for MPC wallet operations will be stored in a `.env` file.
  - For wallet balance operations, utilize `cdp_listBalances` from the Coinbase API.
  
- **Interactive Guidance & Commands:**  
  - Users interact with the Portfolio Manager agent to perform a limited set of wallet actions:
    - **Show Balance:** Retrieve balances using `cdp_listBalances`.
    - **Send ETH:** E.g., send 0.0001 ETH to a specified address.
    - **Swap ETH to USDC:** Execute a swap action via Agentkit.
    - **Show Wallet Address:** Display the currently active wallet.
    - **Show Portfolio:** Present a portfolio summary.
  - Remove features like faucet top-up, daily reporting, basename registration, and strategy suggestions.

---

## 3. Functional Requirements

1. **User Interaction Chat Interface:**  
   - Utilize a library (e.g., Inquirer) for CLI prompts.
   - Manage all interactions via a dialogue with the Portfolio Manager agent.

2. **Mode Selection & Wallet Setup:**  
   - **Greeting:** Display a welcome message (and optionally an ASCII art logo).
   - **Mode Choice:**  
     - Prompt the user to select between:
       - **Onboarding Mode:** Active mode with full Coinbase MPC Wallet integration.
       - **Investment Mode:** Displayed as a menu option but not implemented.
   - **Wallet Setup for Onboarding Mode:**  
     - Ask for a username.
     - Initialize wallet connectivity using Coinbase MPC Wallet Agentkit, reading API keys from the `.env` file.

3. **Core Conversation & Actions:**  
   - Present a menu with only the following actions:
     - **Balance Check:** Use Agentkit to call `cdp_listBalances`.
     - **Send ETH:** Action to send a small ETH amount to a given address.
     - **Swap ETH to USDC:** Execute token swap via Agentkit.
     - **Show Wallet Address:** Display wallet details.
     - **Show Portfolio:** Display a portfolio summary.
   - All operations are performed via Agentkit actions.

4. **State Management:**  
   - Maintain an in-memory session to track the user’s mode, username, wallet details, and current balance.

---

## 4. Technical Requirements

- **Environment:**  
  - Node.js (Latest LTS version)
  
- **Libraries & SDKs:**  
  - **Coinbase Agentkit:** For interacting with the MPC Wallet (refer to the [Wallet Management Docs](https://docs.cdp.coinbase.com/agentkit/docs/wallet-management), [Quickstart](https://docs.cdp.coinbase.com/agentkit/docs/quickstart), and the [MPC Wallet Quickstart](https://docs.cdp.coinbase.com/wallet-api/docs/quickstart)).
  - **Inquirer** for CLI interactions.
  - **dotenv** for loading environment variables from a `.env` file.

- **Architecture:**  
  - Structure can be single or multi-file:
    - `index.js`: Contains the main program loop and flow.
    - Additional modules (e.g., `wallet.js`) to encapsulate wallet operations via Agentkit.
  - **Base Testnet:**  
    - Use Base testnet for wallet operations. RPC Endpoint: [https://api.developer.coinbase.com/rpc/v1/base-sepolia/kNI0M0LbTjx7vBycGDfkkQcTH7pX2CEj](https://api.developer.coinbase.com/rpc/v1/base-sepolia/kNI0M0LbTjx7vBycGDfkkQcTH7pX2CEj).

- **Design Considerations:**  
  - Integrate with an actual Coinbase MPC Wallet using Agentkit.
  - Skip features such as faucet top-up, daily report, basename registration, and strategy suggestions.
  - Limit user commands to the essential set for wallet interaction.

---

## 5. User Flow

1. **Launch App:**  
   - Run `node index.js`.
   - Display an ASCII art logo and welcome message.

2. **Mode Selection:**  
   - Prompt: "Select Mode: 1) Onboarding (Active)  2) Investment (Not Yet Implemented)"
  
3. **Wallet Setup (Onboarding Mode):**  
   - User enters a preferred username.
   - Wallet is initialized using Coinbase MPC Wallet Agentkit, with API keys loaded from `.env`.

4. **Main Interaction Loop:**  
   - Present available actions:
     - `[B]alance Check`: Retrieve wallet balances using `cdp_listBalances`.
     - `[S]end ETH`: Send a fixed amount (e.g., 0.0001 ETH) to a given address.
     - `[W]allet Address`: Display the active wallet address.
     - `[K] Swap ETH to USDC`: Execute a token swap.
     - `[P]ortfolio`: Show a portfolio summary.
     - `[Q]uit`: Exit the app.

5. **Transaction Operations:**  
   - Each action triggers a corresponding Agentkit operation.
   - Validate user inputs and handle errors robustly.
    
---

## 6. Non-Functional Requirements

- **Simplicity:**  
  - Code must be concise, modular, and maintainable.
  
- **User Experience:**  
  - Ensure a seamless and engaging CLI conversation.
  - Include robust input validation and error handling.

- **Security:**  
  - Securely load and manage MPC wallet API keys via a `.env` file.

---

## 7. MVP Timeline & Deliverables

- **Setup & Dependencies (0.5 hr):**  
  - Initialize the project and install required libraries (Coinbase Agentkit, Inquirer, dotenv).

- **CLI & Flow Implementation (1.5 hrs):**  
  - Develop the welcome message, ASCII art logo, and mode selection flow.

- **Wallet Integration Module (2 hrs):**  
  - Implement onboarding mode with Coinbase MPC Wallet integration.
  - Ensure API keys are securely loaded from `.env`.

- **Core Wallet Actions (2 hrs):**  
  - Implement Agentkit actions for:
    - Balance retrieval (`cdp_listBalances`)
    - Sending ETH
    - Swapping ETH to USDC
    - Displaying wallet address and portfolio summary

- **Testing, Debugging & Documentation (1 hr):**  
  - Validate all interactions and robust error handling.

- **Final Touches (1 hr):**  
  - Code clean-up, additional documentation, and final testing.

---

## 8. Risks & Mitigations

- **Limited Functionality:**  
  - Only onboarding mode is active; investment mode is a placeholder.
  
- **Integration Complexity:**  
  - Reliance on Coinbase Agentkit requires thorough testing using Base testnet.

- **Environment Management:**  
  - Ensure secure handling of MPC wallet API keys via the `.env` file.

---

## 9. Future Considerations

- **Expanded Investment Mode:**  
  - Implement full functionality for investment operations.
  
- **Enhanced Integrations:**  
  - Support live blockchain data and additional wallet operations.
  
- **Persistent Sessions:**  
  - Introduce user persistence and advanced portfolio analytics.

- **Advanced Reporting:**  
  - Integrate dynamic analytics and observations in future versions.