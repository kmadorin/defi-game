# DEFI Copilot MVP Product Requirements Document (PRD)

## 1. Overview

**Product:** DEFI Copilot  
**Description:** A gamified DEFI portfolio management chat app that guides users in exploring decentralized finance in a conversational, chat-based interface. This MVP will run as a Node.js terminal app.

**Objective for MVP:**  
Implement a terminal-based chat experience in one day. The app will simulate a Portfolio Manager that onboards the user, gathers basic details, and guides the user through either a risk-free (onboarding) or real-money (investment) mode using simulated flows for wallet creation and transaction suggestions.

---

## 2. MVP Goals & Use-Cases

- **Chat Simulation:** Deliver a basic conversational flow where the app acts as the Portfolio Manager.
- **Mode Selection:** Enable the user to choose between:
  - **Onboarding Mode:** Use a test/forked network with faucet-based top-up.
  - **Investment Mode:** Simulate interactions for a mainnet experience with Coinbase onramp/from-wallet top-up.
- **Wallet Creation:** Collect user details (username, wallet simulation) and confirm the creation.
- **Transaction Simulation:** Let the agent simulate a DEFI transaction process (e.g., yield strategy suggestion) and output a dummy simulation result.
- **User Task Commands:** Optionally allow commands like "daily report" that print a static/hard-coded summary.

---

## 3. Functional Requirements

1. **User Interaction Chat Interface:**  
   - The Node.js app will use a terminal prompt (using libraries like [Inquirer](https://www.npmjs.com/package/inquirer) or Node's built-in readline) to simulate a chat.
   - The conversation must be sequential, with the Portfolio Manager agent asking questions and processing user responses.

2. **Onboarding Flow:**  
   - **Greeting & Mode Selection:**  
     - Display an introductory message.
     - Prompt user to choose between Onboarding mode or Investment mode.
   - **Wallet Creation:**  
     - Ask for a preferred username.
     - Simulate wallet creation (e.g., by generating a random identifier).
   - **Wallet Top-Up Simulation:**  
     - **Onboarding Mode:** Simulate a faucet top-up (display a fixed "faucet credit" value).
     - **Investment Mode:** Simulate a Coinbase onramp/top-up prompt with a dummy amount confirmation.

3. **Interactive Guidance:**  
   - After onboarding, offer options to "learn about DEFI protocols" or "simulate a transaction".
   - If the user opts to simulate a transaction (e.g., find the best yield for USDC), the app will:
     - Display a dummy simulated transaction detail.
     - Prompt the user to "accept" or "reject" the simulated outcome.

4. **Reporting/Task Scheduling (Optional for MVP):**  
   - Allow a simple command (e.g., entering `report`) to display a hardcoded daily summary of portfolio metrics.

5. **State Management:**  
   - In-memory state to hold the session data (user mode, username, wallet details). No persistent storage necessary.

---

## 4. Technical Requirements

- **Language & Runtime:**  
  - Node.js (Latest LTS version).

- **Libraries:**  
  - **Inquirer** for interactive prompts.
  - **Chalk** (optional) for simple colored output.
  
- **Architecture:**  
  - A single-file or two-file structure is acceptable. For instance:
    - `index.js`: Contains the main program loop and conversation logic.
    - (Optionally) `chatFlow.js`: Encapsulate chat flow functions.
  
- **Integration Simulation:**  
  - No real blockchain or API integration; use hardcoded values and simple algorithms.
  
- **Design Consideration:**  
  - Keep logic modular. Separate wallet creation, mode selection, simulation, and reporting for clarity.
  - Focus on a simple, linear conversation path.

---

## 5. User Flow

1. **Launch App:**  
   - Display welcome message with a brief product intro.
   
2. **Mode Selection Dialogue:**  
   - Prompt: "Select mode: 1) Onboarding or 2) Investment"
   
3. **Wallet Setup:**
   - Ask for a username.
   - Simulate wallet creation.
   - Depending on mode:
     - **Onboarding:** "Simulating faucet top-up (e.g., 100 test tokens)."
     - **Investment:** "Simulating Coinbase onramp top-up (enter simulated amount)."

4. **Core Conversation:**
   - Present options like:
     - "Learn about DEFI protocols"
     - "Simulate a transaction"
   - If transaction is simulated:
     - Present a dummy transaction, e.g., "Best yield for USDC via Protocol X yields 5% APY."
     - Ask: "Accept transaction? (yes/no)"
   - Log outcome and continue dialogue or exit.

5. **Additional Commands:**  
   - Command `report` prints a static portfolio update.

6. **Exit:**  
   - Provide a command to gracefully exit the conversation.

---

## 6. Non-Functional Requirements

- **Simplicity:**  
  - Code should be concise, self-contained, and runnable in the terminal.
  
- **User Experience:**  
  - The interface should feel like a natural conversation, even if it's linear.
  
- **Error Handling:**  
  - Handle unexpected user inputs gracefully with reprompts.
  
- **Time-to-MVP:**  
  - The entire flow must be implementable, testable, and demonstrable within one workday.

---

## 7. MVP Timeline & Deliverables

- **Setup & Library Installation (0.5 hr):**  
  - Initialize Node.js project and install dependencies (inquirer, chalk).

- **Chat Interface & Basic Flow (2 hrs):**  
  - Implement welcome message, mode selection, and wallet creation flows.

- **Transaction Simulation & Additional Commands (2 hrs):**  
  - Implement dummy transaction simulation and daily report command.

- **Testing & Debugging Implementation (1.5 hrs):**  
  - Ensure robustness in user input handling, conversation flow, and error cases.

- **Cleanup & Documentation (1 hr):**  
  - Code comments, README updates, and final testing.

---

## 8. Risks & Mitigations

- **Limited Simulation:**  
  - Since won't interact with real APIs, ensure clear messaging in the UI that the simulation is dummy.
  
- **User Input Mismanagement:**  
  - Rely on robust prompt loops and input validations from inquirer.
  
- **Time Constraints:**  
  - Keep the scope minimal: only simulate core onboarding, wallet setup, and one transformation transaction.

---

## 9. Future Considerations (Beyond MVP)

- Actual integration with platforms like Coinbase for wallet management.
- Use of LLMs or frameworks like Agentkit for more natural conversation.
- Dynamic API responses using Alchemy/Tenderly for transaction simulations.
- Persistent user sessions storage for portfolio history.
- Expanded reporting features leveraging blockchain data APIs.
