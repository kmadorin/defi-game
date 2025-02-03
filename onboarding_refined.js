import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ConversationChain } from 'langchain/chains';
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import inquirer from 'inquirer';
import fs from 'fs-extra';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { z } from "zod";
import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';
import { BufferMemory } from 'langchain/memory';

dotenv.config();

// Initialize ChatOpenAI with GPT-4
const chat = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 500
});

// Initialize memory with proper exports
const memory = new BufferMemory({
  chatHistory: new ChatMessageHistory(),
  returnMessages: true,
  memoryKey: "chat_history"
});

// Base system prompt that defines Sam's personality and behavior
const baseSystemPrompt = `
You are Sam, a friendly and knowledgeable DEFI portfolio advisor. Your role is to:
- Maintain a warm, conversational tone
- Extract key information naturally from user responses
- Guide users through the onboarding process without feeling mechanical
- Never display technical details or JSON to users

Current conversation stage: {stage}
Previous context: {context}
`;

// Conversation stages
const stages = {
  INTRODUCTION: 'introduction',
  GOALS: 'goals',
  EXPERIENCE: 'experience',
  RISK_TOLERANCE: 'risk_tolerance',
  INVESTMENT_APPROACH: 'investment_approach',
  CONFIRMATION: 'confirmation'
};

// Initialize memory.json if it doesn't exist
const initializeMemory = async () => {
  try {
    await fs.ensureFile('memory.json');
    const exists = await fs.pathExists('memory.json');
    if (!exists || (await fs.readFile('memory.json', 'utf8')).trim() === '') {
      await fs.writeJson('memory.json', {}, { spaces: 2 });
    }
  } catch (error) {
    console.error(chalk.red('Error initializing memory.json:'), error);
    process.exit(1);
  }
};

// Define the schema for classification results
const classificationSchema = z.object({
  goals: z.enum(['long-term', 'quick-gains', 'balanced', 'passive-income', 'learning']).optional(),
  experience: z.enum(['beginner', 'basic', 'intermediate', 'advanced', 'expert']).optional(),
  riskTolerance: z.enum(['very-conservative', 'conservative', 'moderate', 'aggressive', 'very-aggressive']).optional()
});

// Create a parser with the schema
const outputParser = StructuredOutputParser.fromZodSchema(classificationSchema);

// Modify classification to use structured output
const classifyResponse = async (response, currentStage) => {
  const format_instructions = outputParser.getFormatInstructions();

  const classificationPrompt = ChatPromptTemplate.fromTemplate(`
    Analyze the user's response and extract relevant information.
    Current stage: {currentStage}
    User response: {response}

    {format_instructions}

    Only include fields where you have high confidence in the classification.
  `);

  try {
    const result = await chat.invoke(
      await classificationPrompt.formatMessages({
        response: response,
        currentStage: currentStage,
        format_instructions: format_instructions
      })
    );
    
    // Use the parser to ensure proper structure
    return await outputParser.parse(result.content);
  } catch (error) {
    console.error('Classification error:', error);
    // Return empty object instead of throwing
    return {};
  }
};

// Add input validation for classification results
const validateClassification = (result, category) => {
  const validCategories = {
    goals: ['long-term', 'quick-gains', 'balanced', 'passive-income', 'learning'],
    experience: ['beginner', 'basic', 'intermediate', 'advanced', 'expert'],
    riskTolerance: ['very-conservative', 'conservative', 'moderate', 'aggressive', 'very-aggressive']
  };

  if (!validCategories[category].includes(result)) {
    throw new Error(`Invalid classification result: ${result} for category: ${category}`);
  }
  return result;
};

// Update ConversationManager class
class ConversationManager {
  constructor() {
    // Initialize an empty object to store the user's data
    this.userData = {};
    // Define the ordered list of questions along with their corresponding keys
    this.questions = [
      { key: 'username', question: "What should I call you?" },
      { key: 'defiGoals', question: "What specifically interests you about DEFI?" },
      { key: 'experience', question: "Do you have any prior experience with similar investments?" },
      { key: 'riskTolerance', question: "How do you feel about risk? (e.g., conservative, moderate, aggressive)" }
    ];
    // Track which question is currently being asked
    this.currentQuestionIndex = 0;

    // Initialize the conversation chain as before
    this.chain = new ConversationChain({
      llm: chat,
      memory: memory,
      verbose: true,
      prompt: ChatPromptTemplate.fromMessages([
        ["system", baseSystemPrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"]
      ])
    });
  }

  // Returns the next unanswered question (ensuring asynchronous consistency).
  async getNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length) {
      return this.questions[this.currentQuestionIndex].question;
    }
    return this.handleConfirmationStage();
  }

  // Processes the user's input and then returns a tailored response including acknowledgments.
  async processUserInput(input) {
    let acknowledgment = '';

    // Handle confirmation stage separately
    if (this.currentQuestionIndex >= this.questions.length) {
      return this.handleConfirmationResponse(input);
    }

    // Handle the introduction stage
    if (this.currentQuestionIndex === 0) {
      this.userData.username = input.trim();
      acknowledgment = `Thanks ${this.userData.username}! `;
      this.currentQuestionIndex++;
      return acknowledgment + await this.getNextQuestion();
    }

    // Determine which field is being answered based on current question index.
    const currentKey = this.questions[this.currentQuestionIndex].key;

    // Check for skip phrases more robustly.
    const normalizedInput = input.toLowerCase();
    if (
      normalizedInput.includes("already answered") ||
      normalizedInput.includes("as i said") ||
      normalizedInput.includes("i already")
    ) {
      acknowledgment += `Got it, I'll move on. `;
      // Mark the current field as answered (preserving the previous answer if any).
      if (!this.userData[currentKey]) {
        this.userData[currentKey] = input.trim();
      }
      this.currentQuestionIndex++;
      return acknowledgment + await this.getNextQuestion();
    }

    // Process the answer using your classifier.
    const analysis = await classifyResponse(input, "multiple");

    // Check and acknowledge based on the current question key.
    if (currentKey === "defiGoals") {
      if (analysis.goals && !this.userData.defiGoals) {
        this.userData.defiGoals = analysis.goals;
        acknowledgment += `Noted that you're interested in ${this.userData.defiGoals}. `;
      } else if (!this.userData.defiGoals) {
        // Fallback: save the raw input if classifier didn't extract a clear answer.
        this.userData.defiGoals = input.trim();
        acknowledgment += `Thanks for sharing your thoughts on DEFI. `;
      }
    } else if (currentKey === "experience") {
      if (analysis.experience && !this.userData.experience) {
        this.userData.experience = analysis.experience;
        acknowledgment += `I appreciate you sharing that you have ${this.userData.experience} experience. `;
      } else if (!this.userData.experience) {
        this.userData.experience = input.trim();
        acknowledgment += `Got it regarding your experience. `;
      }
    } else if (currentKey === "riskTolerance") {
      if (analysis.riskTolerance && !this.userData.riskTolerance) {
        this.userData.riskTolerance = analysis.riskTolerance;
        acknowledgment += `Thanks for letting me know that your risk tolerance is ${this.userData.riskTolerance}. `;
      } else if (!this.userData.riskTolerance) {
        this.userData.riskTolerance = input.trim();
        acknowledgment += `Understood. `;
      }
    }

    // Move to the next question.
    this.currentQuestionIndex++;
    return acknowledgment + await this.getNextQuestion();
  }

  async handleConfirmationResponse(input) {
    if (input.toLowerCase().startsWith('y')) {
      await this.saveUserData();
      return chalk.green('\nThank you for completing the onboarding process!');
    } else {
      this.currentQuestionIndex = 0;
      this.userData = {};
      return chalk.yellow('\nLet\'s start over to get your information correct.') + 
             '\n' + chalk.cyan("What should I call you?");
    }
  }

  async handleConfirmationStage() {
    const summary = await this.generateSummary();
    return `${summary}\nDoes this all look correct to you? (yes/no)`;
  }

  async generateSummary() {
    const summaryPrompt = ChatPromptTemplate.fromMessages([
      ["system", "Transform this JSON data into a friendly, conversational summary:\n{data}"],
      ["human", "{data}"]
    ]);

    const result = await chat.invoke(
      await summaryPrompt.formatMessages({
        data: JSON.stringify(this.userData, null, 2)
      })
    );

    return result.content;
  }

  async saveUserData() {
    try {
      const existingData = await fs.readJson('memory.json');
      const newData = { ...existingData, ...this.userData };
      await fs.writeJson('memory.json', newData, { spaces: 2 });
      console.log(chalk.green('User data saved successfully.'));
    } catch (error) {
      console.error(chalk.red('Error saving data:'), error);
      throw error;
    }
  }

  async handleGoalsStage() {
    return `Thanks ${this.userData.username}! Could you please share:
    1. What specifically interests you about DEFI?
    2. Any prior experience with similar investments?
    (Feel free to answer both or just one at a time)`;
  }

  async handleExperienceStage() {
    if (this.userData.experience) {
      return `You mentioned ${this.userData.experience} experience earlier. 
      Would you like to elaborate or should we move to risk assessment?`;
    }
    return `To better tailor advice, could you share your experience level?`;
  }

  async handleRiskToleranceStage() {
    const prompt = `Understood. Everyone starts somewhere! How would you describe your comfort level with risk? 
    Are you more cautious, willing to take moderate risks, or comfortable with higher risks for potential rewards?`;
    return prompt;
  }

  async handleInvestmentApproachStage() {
    const prompt = `Lastly, would you prefer a conservative approach that prioritizes capital preservation, 
    a balanced mix, or a more aggressive growth-oriented strategy?`;
    return prompt;
  }

  // Add other stage handlers...

  getCurrentQuestion() {
    const questions = {
      [stages.INTRODUCTION]: "What should I call you?",
      [stages.GOALS]: "What are your DEFI goals?",
      [stages.EXPERIENCE]: "What's your experience level?",
      [stages.RISK_TOLERANCE]: "How do you feel about risk?",
      [stages.INVESTMENT_APPROACH]: "Preferred investment style?",
      [stages.CONFIRMATION]: "Does this look correct?"
    };
    return questions[this.currentStage];
  }
}

// Main onboarding flow
const startOnboarding = async () => {
  try {
    const conversation = new ConversationManager();
    
    // Initial greeting
    console.log(chalk.cyan("Hi there! I'm Sam, and I'll be your guide into the world of decentralized finance. Before we dive in, I'd love to get to know you better. What should I call you?"));

    // Start the conversation loop
    while (true) {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.green('You:'),
          validate: (input) => input.trim() !== '' || 'Please say something.',
        },
      ]);

      const response = await conversation.processUserInput(input);
      console.log(chalk.cyan('Sam:', response));

      if (conversation.currentStage === stages.CONFIRMATION) {
        break;
      }
    }

  } catch (error) {
    console.error(chalk.red('An error occurred during onboarding:'), error);
    process.exit(1);
  }
};

// Initialize and start the onboarding process
const main = async () => {
  try {
    await initializeMemory();
    await startOnboarding();
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
};

main();
