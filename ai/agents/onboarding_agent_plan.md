# DEFI Copilot - Onboarding Agent Implementation Plan (Updated)

This document provides a step-by-step plan for a Junior Developer to implement the DEFI Copilot Onboarding Agent, codenamed **Sam**, using langchain.js and Cursor Composer. The agent interacts with users via a CLI, gathers essential details, and persists the data to a local `memory.json` file. This plan leverages the [Langchain-JS documentation](https://js.langchain.com/docs) for guidance.

---

## Step 1: Confirm Existing Environment

Since the project is already set up with all required packages (langchain, inquirer, chalk, and the built-in fs module), you can skip the installation steps. Ensure the existing project has the following structure:

```
defi-copilot/
├── ai/
│   └── agents/
│       ├── onboarding_agent_overview.md    // Contains Sam's personality, role, and dialogue examples.
│       ├── tutoring_prompt.md              // Contains the conversational script for Sam.
│       ├── onboarding_prd.md               // The PRD document.
│       └── onboarding_agent_plan.md        // This implementation plan.
├── onboarding.js                           // Main code for the onboarding agent.
├── memory.json                             // Local persistent storage for user data (should be initialized as {}).
└── package.json
```

Verify that `memory.json` exists and is initialized with an empty JSON object (`{}`).

---

## Step 2: Implementing the Conversational Flow in `onboarding.js`

1. **Set Up Imports and Basic Configuration:**
   - Import the required modules:
     - `inquirer` for CLI prompt handling.
     - `fs` to read/write the `memory.json` file.
     - `chalk` for colored terminal output (if desired).
     - Langchain components such as `ChatPromptTemplate`, and optionally `ChatOpenAI` for context-based interactions.
   
   Example:
   ```javascript
   const inquirer = require('inquirer');
   const fs = require('fs');
   const chalk = require('chalk');
   const { ChatPromptTemplate } = require('langchain/prompts');
   // Import additional Langchain modules as needed
   ```

2. **Define the Conversation Steps:**
   - **Step 1: Introduction & Name Collection**
     - Prompt: "Hello! I'm Sam, your friendly guide at DEFI Copilot. I'm here to help tailor your experience with decentralized finance. What's your name?"
   - **Step 2: Discovering Financial Goals**
     - Prompt: "What brings you to the world of decentralized finance? Are you looking for long-term growth, quick gains, or maybe a balanced strategy?"
   - **Step 3: Assessing Experience Level**
     - Prompt: "Do you have any prior experience with decentralized finance, or is this your first venture?"
   - **Step 4: Understanding Risk Tolerance & Investment Approach**
     - Prompt: "How would you describe your risk tolerance? Would you say you're risk-averse, moderately risk-tolerant, or aggressive?"
     - (Optional follow-up): "And do you consider yourself more conservative, balanced, or aggressive with your investment approach?"
   - **Step 5: Confirmation & Summary**
     - Summarize the collected data in a JSON-like object and ask the user to confirm that the information is accurate.

3. **Set Up Langchain Context:**
   - To ensure Sam is contextually aware of his role, define a system-level context message:
   ```javascript
   const systemMessage = "You are Sam, the onboarding agent for DEFI Copilot. Your role is to collect user details that will be used to personalize the Portfolio Manager experience.";
   // Integrate this message into your Langchain prompt templates if needed.
   ```

4. **Implement the Conversational Flow with Inquirer:**
   - Create a series of prompts using Inquirer to capture user input for each step.
   - Store the responses in an object as they are collected.

---

## Step 3: Storing Data in `memory.json`

1. **Define the User Data Object:**
   - Structure the data as follows:
   ```json
   {
     "username": "JohnDoe",
     "defiGoals": "Long-term growth and passive income",
     "investmentApproach": "Conservative with selective risk-taking",
     "experience": "Beginner",
     "riskTolerance": "Moderate"
   }
   ```

2. **Save the Data using fs:**
   - Write the JSON object to `memory.json` upon user confirmation.
   - Example snippet:
   ```javascript
   const saveUserData = (data) => {
     fs.writeFileSync('memory.json', JSON.stringify(data, null, 2));
     console.log(chalk.green('User data saved successfully in memory.json.'));
   };
   ```

---

## Step 4: Error Handling and Input Validation

1. **Validate User Inputs:**
   - Make sure each input is not empty and follows the expected format.
   - Implement validation functions within the Inquirer prompt settings.

2. **Implement Robust Error Handling:**
   - Wrap file operations and prompt executions in try-catch blocks to handle potential errors gracefully.
   - Log any errors encountered for debugging purposes.

---

## Step 5: Testing the Agent

1. **Manual Testing:**
   - Run the onboarding agent from the CLI:
   ```bash
   node onboarding.js
   ```
   - Walk through the conversation steps to ensure each prompt behaves as expected and the data is correctly saved in `memory.json`.

2. **Automated Testing (Optional):**
   - Use frameworks such as Mocha or Jest to simulate inputs and verify that data persistence occurs as expected.
   - Test edge cases, such as invalid inputs or unexpected interruptions in the conversation flow.

---

## Step 6: Finalization and Documentation

1. **Document Your Code:**
   - Add clear comments throughout the code to explain each part of the implementation.
   - Include references to the PRD (`onboarding_prd.md`) and the agent overview (`onboarding_agent_overview.md`) for additional context.

2. **Version Control and Code Review:**
   - Commit your changes to Git and request a peer review to ensure your implementation meets the project requirements.

3. **Refine the Code:**
   - Refactor and clean up your implementation as needed to enhance clarity and efficiency.
   - Verify that all functional and non-functional requirements are met.

---

## Resources

- **Langchain-JS Documentation:** [https://js.langchain.com/docs](https://js.langchain.com/docs)
- **Langchain Agents Guide:** [https://js.langchain.com/docs/modules/agents/agent_types/react](https://js.langchain.com/docs/modules/agents/agent_types/react)
- **Cursor Composer Documentation:** *(Include link if available)*

---

**Summary:**  
This updated implementation plan guides you through leveraging an already set up environment to build the onboarding agent, Sam, using langchain.js and Cursor Composer. You will implement a conversational flow with Inquirer, persist user data in `memory.json`, integrate Langchain for context injection, and thoroughly test the agent. Following this plan will help deliver a robust onboarding experience integrated into the DEFI Copilot ecosystem.

Happy coding!
