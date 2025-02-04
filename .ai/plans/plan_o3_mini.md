# DEFI Copilot MVP Implementation Plan

- [ ] **Project Setup**
  - [ ] Initialize a new Node.js project (run `npm init -y`).
  - [ ] Install dependencies:
    - Inquirer (`npm install inquirer`)
    - Chalk (optional: `npm install chalk`)
  - [ ] Create the basic folder structure:
    - `index.js` (main entry point)
    - Optionally, additional modules (e.g., `chatFlow.js` for wallet and transaction logic).

- [ ] **Build the Welcome & Mode Selection**
  - [ ] Write a welcome message (include ASCII art if desired).
  - [ ] Describe the product and prompt the user to select a mode:
    - Onboarding (Test/Sandbox)
    - Investment (Simulated Mainnet)
  - [ ] Use Inquirer to show a list prompt for mode selection.

- [ ] **Implement Wallet Setup & Mode-Specific Logic**
  - [ ] Prompt the user for a username.
  - [ ] Generate a simulated wallet address (a dummy 0x address).
  - [ ] For **Onboarding Mode:**
    - [ ] Auto top-up with a faucet simulation (e.g., starting balance 0.1 ETH plus additional 0.5 ETH per faucet use).
  - [ ] For **Investment Mode:**
    - [ ] Simulate a Coinbase onramp prompt where the user "tops up" with dummy funds.
  - [ ] Store the user session data (username, wallet, mode, balance) in-memory.

- [ ] **Create the Main Interaction Loop**
  - [ ] Display a menu of actionable options:
    - [ ] `[F]aucet` - For extra top-ups in test mode.
    - [ ] `[B]alance Check` - To show current simulated balance.
    - [ ] `[S]trategy Suggestion` - To display hardcoded DEFI strategy insights.
    - [ ] `[T]ransaction Simulation` - To simulate a yield farming transaction with confirmation.
    - [ ] `[R]eport` - To display a static daily portfolio summary.
    - [ ] `[Q]uit` - Exit the application.
  - [ ] Loop using Inquirer prompts to handle user selections continuously.

- [ ] **Implement Command Actions**
  - [ ] **Faucet Functionality:**
    - Increase the balance (simulate a top-up) and inform the user.
  - [ ] **Balance Check Function:**
    - Display the current in-memory balance.
  - [ ] **Strategy Suggestion:**
    - Output a hardcoded list of DEFI strategies and explanations.
  - [ ] **Transaction Simulation:**
    - Show dummy transaction details (e.g., calculated yield/APY).
    - Ask for a confirmation ("Accept transaction? (yes/no)").
    - Log the outcome and update state if needed.
  - [ ] **Daily Report:**
    - Present a static summary of the portfolio.

- [ ] **Add Input Validation & Error Handling**
  - [ ] Validate all user inputs.
  - [ ] Handle unexpected inputs with re-prompts or error messages.

- [ ] **Testing & Debugging**
  - [ ] Test each mode (Onboarding & Investment) end-to-end.
  - [ ] Validate that state and in-memory session persist as expected.
  - [ ] Fix any bugs found during manual testing.

- [ ] **Final Code Clean-up & Documentation**
  - [ ] Add inline comments to key sections of the code.
  - [ ] Ensure the code is formatted for terminal display (up to 80 columns).
  - [ ] Update the README with instructions on how to run and test the app.
