# DEFI Copilot MVP Product Requirements Document (Aggregated)

## 1. Overview

**Product:** DEFI Copilot  
**Description:**  
A gamified DEFI portfolio management chat app that guides users through decentralized finance topics in a conversational, terminal-based interface.

**Core Objective:**  
Deliver a one-day MVP using Node.js that simulates a conversational portfolio manager. The app will support both test/sandbox and simulated investment modes.

---

## 2. MVP Goals & Use-Cases

- **Conversational Chat Interface:**  
  - Provide a natural, sequential conversation using terminal prompts.

- **Mode Selection:**  
  - **Onboarding Mode:**  
    - Simulate wallet creation with a test ETH address.
    - Include a faucet simulation with fixed/test tokens (e.g., +0.5 ETH per faucet use) starting from an initial balance.
  - **Investment Mode:**  
    - Simulate wallet creation with a dummy Coinbase onramp top-up.
  
- **Wallet Creation & Management:**  
  - Allow users to set up a username.
  - Generate a mock wallet (simulated 0x address) and maintain session data in memory.
  
- **Interactive Guidance:**  
  - Provide hardcoded explanations of DEFI protocols (e.g., Uniswap, Aave, Compound) and strategy suggestions.
  - Simulate DEFI transactions (e.g., yield farming calculations) that display dummy APY results.
  
- **Additional Commands:**  
  - Enable commands like `report` for showing a static daily portfolio summary.
  - Include options for balance checks, transaction simulations, and Strategy suggestions within a main loop.

---

## 3. Functional Requirements

1. **User Interaction Chat Interface:**  
   - Utilize libraries like [Inquirer](https://www.npmjs.com/package/inquirer) for CLI prompts.
   - Ensure a sequential, user-friendly conversation (optionally greet with an ASCII art logo).

2. **Mode Selection & Wallet Creation:**  
   - **Greeting:** Display a welcome message with product overview.
   - **Mode Choice:** Prompt the user to select:
     - Onboarding Mode (Test/Sandbox)
     - Investment Mode (Simulated Mainnet)
   - **Wallet Setup:**  
     - Ask for a username.
     - Generate a simulated wallet (0x address).
     - For **Onboarding Mode:**  
       - Simulate an automatic faucet top-up (e.g., starting balance 0.1 ETH with +0.5 ETH per faucet use).
     - For **Investment Mode:**  
       - Simulate a Coinbase onramp prompt for a dummy fund entry.

3. **Core Conversation & Actions:**  
   - Present a menu with options to:
     - Use Faucet (for test mode top-ups)
     - Check Balance
     - Get a Strategy Suggestion (hardcoded insights)
     - Simulate a Transaction (e.g., yield output with a confirmation prompt)
     - Generate a Daily Report
     - Quit the application
   - Capture and validate user inputs with robust error handling.

4. **State Management:**  
   - Maintain an in-memory session to track mode, username, wallet details, and balance.

---

## 4. Technical Requirements

- **Environment:**  
  - Node.js (Latest LTS version)
  
- **Libraries:**  
  - **Inquirer** for CLI interactions.
  - **Chalk** (optional) for terminal colors.

- **Architecture:**  
  - Structure can be single or multi-file:
    - `index.js`: Main program loop and flow.
    - Optionally, additional modules (e.g., `chatFlow.js`) to encapsulate wallet operations, transaction simulation, and reporting.
  
- **Design Considerations:**  
  - Use hardcoded values for simulation; no real blockchain or API integration.
  - Keep code modular and concise.
  - Maintain terminal-friendly formatting (up to 80 columns).

---

## 5. User Flow

1. **Launch App:**  
   - Run `node index.js`.
   - Optionally display an ASCII art logo and a welcome message.

2. **Mode Selection:**  
   - Prompt: "Select Mode: 1) Onboarding (Test)  2) Investment (Simulated)"
  
3. **Wallet Setup:**  
   - Enter a preferred username.
   - Generate a fake wallet (simulated 0x address).
   - Depending on the mode:
     - **Onboarding Mode:** Auto top-up via a faucet simulation.
     - **Investment Mode:** Simulate Coinbase onramp top-up.

4. **Main Interaction Loop:**  
   - Present actionable options:
     - `[F]aucet`: For additional test mode top-ups.
     - `[B]alance Check`: To view current simulated balance.
     - `[S]trategy Suggestion`: To fetch hardcoded DEFI strategies.
     - `[T]ransaction Simulation`: To simulate a yield transaction (e.g., 5% APY) with confirmation.
     - `[R]eport`: To display a static daily summary.
     - `[Q]uit`: To exit the app.

5. **Transaction Simulation:**  
   - Display dummy simulation details.
   - Ask for a confirmation ("Accept transaction? (yes/no)").
   - Log outcome and return to the main loop.

---

## 6. Non-Functional Requirements

- **Simplicity:**  
  - The code should be concise, readable, and self-contained.
  
- **User Experience:**  
  - Create a natural and engaging CLI conversation.
  - Ensure robust input validation and error-handling.

- **Time Constraints:**  
  - The MVP is designed to be implementable within approximately 8 hours.

---

## 7. MVP Timeline & Deliverables

- **Setup & Dependencies (0.5 hr):**  
  - Initialize project and install required libraries (Inquirer, Chalk).

- **Core CLI & Flow Implementation (2 hrs):**  
  - Develop welcome message, ASCII art (optional), and mode selection.

- **Wallet Simulation Module (2 hrs):**  
  - Develop username input, mock wallet address generation, and faucet simulation.

- **Interactive Guidance & Transaction Simulation (2 hrs):**  
  - Set up conversation for strategy suggestions and transaction simulations.

- **Testing, Debugging & Documentation (1.5 hrs):**  
  - Validate inputs with robust error handling and clean up the code.
  
- **Final Touches (1 hr):**  
  - Code clean-up, additional documentation, and final testing.

---

## 8. Risks & Mitigations

- **Limited Simulation Scope:**  
  - Clearly indicate that interactions are simulated using hardcoded values.
  
- **User Input Complexity:**  
  - Use robust prompt loops and validations to handle unexpected inputs.

- **Time Constraints:**  
  - Focus on core functionalities; real integrations can be deferred.

- **State Management:**  
  - Rely on simple in-memory storage to track user session data.

---

## 9. Future Considerations

- **Enhanced Integrations:**  
  - Real blockchain API connections (e.g., to Coinbase or blockchain explorers).
  
- **Dynamic User Experience:**  
  - Introduce AI-driven portfolio management responses and more interactive guidance.
  
- **Persistent Sessions:**  
  - Add database support for user session persistence.
  
- **Advanced Reporting:**  
  - Incorporate live data feeds for detailed portfolio analytics.
