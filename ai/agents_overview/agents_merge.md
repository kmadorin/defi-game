# Agent Integration Plan

## 1. File Structure Reorganization
```
/agents
  portfolioAgent.js    # Extracted from index.js
  onboardingAgent.js   # Modified from onboarding_one_prompt.js
index.js               # Main entry point
memory.json            # User profile data
.env                   # Environment variables
```

## 2. Onboarding Agent Modifications
Key changes needed in `onboardingAgent.js`:
- Remove final confirmation prompt ("Does everything look correct?")
- Change `GENERATE_PROFILE` command to `CREATE_WALLET`
- Return profile data instead of exiting when command received
- Add transition to portfolio agent

## 3. Portfolio Agent Extraction
Create `portfolioAgent.js` with:
- Wallet initialization logic from original index.js
- Balance checking functionality
- Transaction capabilities
- Modified help commands showing wallet-related options

## 4. Index.js Flow Changes
New main flow:
1. Start with onboarding agent
2. On `CREATE_WALLET` command:
   - Save profile to memory.json
   - Switch to portfolio agent
3. Portfolio agent handles:
   - Wallet balance checks
   - Simple transactions
   - Educational content

## 5. State Management
Add to sessionState in index.js:
```javascript
const sessionState = {
  username: null,
  currentAgent: null,  // 'onboarding' or 'portfolio'
  profileData: null,
  wallet: null
};
```

## 6. Agent Transition Handling
Modify runChatMode to:
- Handle agent switching
- Share common state between agents
- Maintain conversation history

## 7. File Operations
- Move existing agent code to /agents directory
- Keep wallet_data.txt for wallet persistence
- Load memory.json at startup if exists

## Implementation Steps

1. Create `/agents` directory
2. Split existing code:
   - Move portfolio logic to `portfolioAgent.js`
   - Move onboarding logic to `onboardingAgent.js`
3. Modify index.js to:
   ```javascript
   import { startOnboarding } from './agents/onboardingAgent.js';
   import { initializePortfolioAgent } from './agents/portfolioAgent.js';
   
   async function main() {
     // Start with onboarding
     const profile = await startOnboarding();
     
     // Initialize portfolio agent with profile
     const portfolioAgent = await initializePortfolioAgent(profile);
     
     // Run portfolio interaction
     await runChatMode(portfolioAgent);
   }
   ```
4. Update onboarding agent to:
   - Remove final confirmation step
   - Return profile data on CREATE_WALLET
   - Remove automatic exit
5. Enhance portfolio agent to:
   - Accept profile data
   - Show personalized greetings
   - Add wallet creation command

## Dependencies to Maintain
- Keep existing package dependencies
- Add shared state management between agents
- Preserve wallet data file handling
