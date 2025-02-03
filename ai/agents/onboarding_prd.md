# DEFI Copilot - Onboarding Agent PRD

## 1. Overview
The Onboarding Agent, codenamed **Sam**, is a conversational guide within the DEFI Copilot ecosystem. Sam's primary role is to engage users in a step-by-step dialogue to collect essential personal and financial details. This information is then used to personalize the subsequent Portfolio Manager experience, ensuring users receive tailored recommendations based on their DEFI goals, risk tolerance, and prior experience.

## 2. Objectives & Goals
- **Engagement:** Create a friendly and natural conversation that puts users at ease.
- **Data Collection:** Capture key information including:
  - User's name
  - DEFI goals (e.g., long-term growth, quick gains, balanced strategy)
  - Investment experience level
  - Risk tolerance (risk-averse, moderately risk-tolerant, or aggressive)
  - (Optionally) Investment approach (conservative, balanced, or aggressive)
- **Personalization:** Use the gathered information to customize the Portfolio Manager experience.
- **Education:** Introduce users to basic DEFI concepts in straightforward language without overwhelming technical jargon.

## 3. Functional Requirements
1. **Conversational Flow:**
   - **Step 1: Introduction & Name Collection**
     - Sam introduces himself and asks, "Hello! I'm Sam, your friendly guide at DEFI Copilot. I'm here to help tailor your experience with decentralized finance. What's your name?"
   - **Step 2: Discovering Financial Goals**
     - Ask, "What brings you to the world of decentralized finance? Are you looking for long-term growth, quick gains, or maybe a balanced strategy?"
   - **Step 3: Assessing Experience Level**
     - Ask, "Do you have any prior experience with decentralized finance, or is this your first venture?"
   - **Step 4: Understanding Risk Tolerance & Investment Approach**
     - Ask, "How would you describe your risk tolerance? Would you say you're risk-averse, moderately risk-tolerant, or aggressive?"
     - Optionally, follow up with: "And do you consider yourself more conservative, balanced, or aggressive with your investment approach?"
   - **Step 5: Confirmation & Information Summary**
     - Summarize the collected details in a JSON-like object stored locally and ask the user to confirm the accuracy of the information.

2. **Structured Data Storage:**
   - The onboarding agent will capture and store user responses in a structured JSON format persisted to a local file, `memory.json`. This file serves as a simple, persistent local storage mechanism so that the Portfolio Manager agent can quickly access and use the relevant details for personalized guidance. An example of the data stored:
     ```json
     {
       "username": "JohnDoe",
       "defiGoals": "Long-term growth and passive income",
       "investmentApproach": "Conservative with selective risk-taking",
       "experience": "Beginner",
       "riskTolerance": "Moderate"
     }
     ```
   - The `memory.json` file will be updated with each new session or as necessary, providing a persistent record of user preferences during the session.

3. **User Interface:**
   - The agent will be implemented in a separate chat module, `onboarding.js`, using CLI tools (e.g., Inquirer for Node.js) to simulate a conversational interaction.

## 4. Non-Functional Requirements
- **User Experience:**
  - Maintain a natural and empathetic tone throughout the conversation.
  - Ask one question at a time to avoid overwhelming the user.
- **Performance:**
  - Provide immediate feedback and responses based on user input.
- **Reliability:**
  - Implement robust error handling and input validation to manage unexpected responses.
- **Security & Privacy:**
  - Process user details with care, storing the data locally in `memory.json`. Persistence methods should follow best practices for local file storage, with potential future enhancements to secure sensitive information.

## 5. User Flow
1. **Initiation:**
   - The user launches the onboarding agent via the dedicated `onboarding.js` file.
2. **Introduction:**
   - Sam welcomes the user and asks for their name.
3. **Detail Collection:**
   - The conversation proceeds sequentially to cover the user's DEFI goals, prior experience, and risk tolerance.
4. **Confirmation:**
   - Sam summarizes the collected information in JSON format (persisted in `memory.json`).
   - The user is prompted to confirm the details or provide corrections.
5. **Transition:**
   - Upon confirmation, Sam informs the user that the information will be used to personalize their subsequent Portfolio Manager experience.

## 6. Technical Requirements
- **Platform:**  
  - Node.js (latest LTS version)
- **Libraries:**
  - **Inquirer:** For CLI-based interactions.
  - **Chalk (Optional):** For color-enhanced terminal output.
  - **fs (File System):** For reading and writing to `memory.json` for local persistence.
- **Modules & Files:**
  - `onboarding.js`: Implements the interactive chat for the onboarding agent.
  - `ai/agents/onboarding_agent_overview.md`: Contains the agent's personality, role, and illustrative example dialogue.
  - `ai/agents/tutoring_prompt.md`: Provides the conversational script used by the agent.
  - `ai/agents/onboarding_prd.md`: This PRD document.
- **Context Injection:**
  - Ensure that Sam is contextually aware of the DEFI Copilot ecosystem and that the collected data flows into the Portfolio Manager to tailor the user experience.
- **Data Storage:**
  - Use a local file `memory.json` to store user preferences persistently, replacing in-memory storage.

## 7. Integration
- **Context Sharing:**
  - The onboarding agent must be initialized with system-level context to recognize that it is part of the larger DEFI Copilot application.
- **Data Handover:**
  - Once the onboarding process is complete, the structured user data from `memory.json` is handed over to the Portfolio Manager module for personalized configuration.

## 8. Future Enhancements
- **Persistent Sessions:**  
  - Improve the storage mechanism with a more robust database system, should basic file storage in `memory.json` become a limitation.
- **Advanced Personalization:**  
  - Utilize AI-driven insights to further customize the user experience in the Portfolio Manager.
- **Multi-Platform Support:**
  - Extend the onboarding experience to web and mobile platforms.

## 9. Testing & Validation
- **Unit Tests:**
  - Test each conversational step, input validation, and error handling.
- **User Trials:**
  - Execute trials through `onboarding.js` to assess conversation flow and user satisfaction.
- **Edge Cases:**
  - Simulate unusual or unexpected inputs to ensure the system handles them gracefully.
- **Data Persistence:**
  - Validate that user information is correctly written to and read from `memory.json`.

---

**Summary:**  
The DEFI Copilot Onboarding Agent "Sam" is designed as a friendly, conversational interface that gathers critical user details to inform a personalized Portfolio Manager experience. By implementing this agent as a dedicated module in `onboarding.js` and storing user preferences in a local `memory.json` file, the project aims to enhance user engagement, deliver tailored DEFI insights, and provide persistent local storage for user data.
