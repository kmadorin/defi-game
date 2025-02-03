import inquirer from 'inquirer';
import fs from 'fs-extra';
import chalk from 'chalk';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

// System message for Sam's context
const systemMessage = `You are Sam, the onboarding agent for DEFI Copilot. Your role is to collect user details that will be used to personalize the Portfolio Manager experience.`;

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

// Save user data to memory.json
const saveUserData = async (data) => {
  try {
    await fs.writeJson('memory.json', data, { spaces: 2 });
    console.log(chalk.green('User data saved successfully in memory.json.'));
  } catch (error) {
    console.error(chalk.red('Error saving user data:'), error);
    throw error;
  }
};

// Main onboarding flow
const startOnboarding = async () => {
  try {
    // Step 1: Introduction & Name Collection
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: chalk.cyan("Hello! I'm Sam, your friendly guide at DEFI Copilot. I'm here to help tailor your experience with decentralized finance. What's your name?"),
        validate: (input) => input.trim() !== '' || 'Please enter your name.',
      },
    ]);

    // Step 2: Financial Goals
    const { goals } = await inquirer.prompt([
      {
        type: 'list',
        name: 'goals',
        message: `${chalk.cyan(`Nice to meet you, ${name}! What brings you to the world of decentralized finance?`)}`,
        choices: [
          'Long-term growth',
          'Quick gains',
          'Balanced strategy',
          'Passive income',
          'Learning and exploration',
        ],
      },
    ]);

    // Step 3: Experience Level
    const { experience } = await inquirer.prompt([
      {
        type: 'list',
        name: 'experience',
        message: chalk.cyan('Do you have any prior experience with decentralized finance?'),
        choices: [
          'Complete beginner',
          'Some basic knowledge',
          'Intermediate',
          'Advanced',
          'Expert',
        ],
      },
    ]);

    // Step 4: Risk Tolerance
    const { riskTolerance } = await inquirer.prompt([
      {
        type: 'list',
        name: 'riskTolerance',
        message: chalk.cyan('How would you describe your risk tolerance?'),
        choices: [
          'Very Conservative (Risk-Averse)',
          'Conservative',
          'Moderate',
          'Aggressive',
          'Very Aggressive (Risk-Seeking)',
        ],
      },
    ]);

    // Step 5: Investment Approach
    const { investmentApproach } = await inquirer.prompt([
      {
        type: 'list',
        name: 'investmentApproach',
        message: chalk.cyan('What investment approach resonates with you the most?'),
        choices: [
          'Conservative - Steady and stable',
          'Balanced - Mix of safety and growth',
          'Growth - Focus on capital appreciation',
          'Aggressive - High risk, high reward',
        ],
      },
    ]);

    // Prepare user data
    const userData = {
      username: name,
      defiGoals: goals,
      experience,
      riskTolerance,
      investmentApproach,
      onboardingDate: new Date().toISOString(),
    };

    // Step 6: Confirmation
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.yellow('Please confirm your information:\n') +
          chalk.white(JSON.stringify(userData, null, 2)) +
          chalk.yellow('\nIs this correct?'),
        default: true,
      },
    ]);

    if (confirm) {
      await saveUserData(userData);
      console.log(chalk.green('\nThank you for completing the onboarding process!'));
      console.log(chalk.cyan("I'll use this information to personalize your DEFI Copilot experience."));

      // Instead of JSON dump:
      const chat = new ChatOpenAI({
        modelName: "gpt-4-turbo",
        temperature: 0.8 // Higher temp for more creative responses
      });

      const summary = await chat.invoke(
        `Create friendly summary for ${name} who's ${experience}:
        - Goals: ${goals}
        - Risk: ${riskTolerance}
        - Experience: ${experience}`
      );

      // Returns natural language like:
      console.log(chalk.cyan(summary));
    } else {
      console.log(chalk.yellow('\nLet\'s start over to get your information correct.'));
      return startOnboarding();
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