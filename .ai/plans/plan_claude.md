# DEFI Copilot MVP Implementation Plan

- [ ] **Project Setup**
  - [ ] Initialize project: `npm init -y`
  - [ ] Install dependencies:
    ```bash
    npm install @coinbase/agentkit @langchain/openai @langchain/langgraph dotenv inquirer
    ```
  - [ ] Create files:
    - `index.js` - Main entry point
    - `config.js` - AgentKit configuration
    - `.env` - Environment variables
    - `.env.example` - Template for required env vars
    - `.gitignore` - Add .env and node_modules

- [ ] **Environment Setup**
  - [ ] Add to `.env`:
    ```
    CDP_API_KEY_NAME=your_api_key_name
    CDP_API_KEY_PRIVATE=your_api_key_private
    OPENAI_API_KEY=your_openai_key
    NETWORK_ID=base-sepolia
    ```

- [ ] **AgentKit Configuration (config.js)**
  - [ ] Setup AgentKit instance:
    ```js
    const { AgentKit, CdpWalletProvider } = require('@coinbase/agentkit');
    
    const initializeAgentKit = async () => {
      // Initialize wallet provider
      const walletProvider = await CdpWalletProvider.configureWithWallet({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivate: process.env.CDP_API_KEY_PRIVATE,
        networkId: process.env.NETWORK_ID
      });

      // Create AgentKit instance with default action providers
      const agentKit = await AgentKit.from({
        walletProvider
      });

      return agentKit;
    };
    ```

- [ ] **CLI Interface Setup**
  - [ ] Create welcome message and mode selection
  - [ ] Implement username prompt
  - [ ] Create main menu options:
    ```js
    const menuChoices = [
      { key: 'B', name: 'Check Balance', value: 'balance' },
      { key: 'S', name: 'Send ETH', value: 'send' },
      { key: 'W', name: 'Show Wallet Address', value: 'address' },
      { key: 'Q', name: 'Quit', value: 'quit' }
    ];
    ```

- [ ] **Action Implementation**
  - [ ] Setup LangChain integration:
    ```js
    const { getLangChainTools } = require('@coinbase/agentkit-langchain');
    const { ChatOpenAI } = require('@langchain/openai');
    const { createReactAgent } = require('@langchain/langgraph/prebuilt');

    const setupAgent = async (agentKit) => {
      const tools = await getLangChainTools(agentKit);
      const llm = new ChatOpenAI({ model: "gpt-4-turbo-preview" });
      
      return createReactAgent({
        llm,
        tools
      });
    };
    ```

- [ ] **Command Actions**
  - [ ] Balance Check:
    - Use CDP provider's listBalances action
  - [ ] Send ETH:
    - Use wallet provider's sendTransaction action
  - [ ] Show Address:
    - Use wallet provider's getAddress action

- [ ] **Error Handling**
  - [ ] Implement try/catch blocks for all AgentKit operations
  - [ ] Add input validation for addresses and amounts
  - [ ] Handle network errors and insufficient funds cases

- [ ] **State Management**
  - [ ] Create session state:
    ```js
    const sessionState = {
      username: null,
      mode: null,
      agentKit: null,
      agent: null
    };
    ```

- [ ] **Testing**
  - [ ] Test on Base Sepolia testnet:
    - Wallet initialization
    - Balance checks
    - Small ETH transfers
  - [ ] Test LangChain agent interactions
  - [ ] Verify error handling

- [ ] **Documentation**
  - [ ] Add JSDoc comments
  - [ ] Create README with:
    - Setup instructions
    - Required API keys
    - Available commands
    - Testing guide

- [ ] **Final Verification**
  - [ ] Test complete flow
  - [ ] Verify all env vars
  - [ ] Check error handling
