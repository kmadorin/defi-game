import inquirer from 'inquirer';
import { GameState } from '../types/index.js';
import { initialDialog } from '../data/mockData.js';
import { UIManager } from '../ui/UIManager.js';
import { GameEngine } from '../models/GameEngine.js';

export class DialogManager {
  private gameState: GameState;
  private uiManager: UIManager;
  private gameEngine: GameEngine;

  constructor(gameState: GameState, uiManager: UIManager, gameEngine: GameEngine) {
    this.gameState = gameState;
    this.uiManager = uiManager;
    this.gameEngine = gameEngine;
  }

  async handleFirstInteraction(): Promise<void> {
    // Welcome message
    console.clear();
    await this.uiManager.showSuccess('Welcome to DeFi Mentor! 🚀');

    // Get player name
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'What should we call you?',
      validate: (input: string) => input.length > 0 || 'Please enter a name'
    });
    this.gameState.player.name = name;

    // Set financial goals
    await this.handleFinancialGoals();

    // Set risk tolerance
    await this.handleRiskTolerance();

    // Initial portfolio setup
    await this.handleInitialPortfolio();
  }

  async handleFinancialGoals(): Promise<void> {
    const { goal } = await inquirer.prompt({
      type: 'list',
      name: 'goal',
      message: 'What\'s your monthly earning goal in DeFi?',
      choices: [
        { name: '🎯 Conservative: $100', value: 100 },
        { name: '🎯 Moderate: $500', value: 500 },
        { name: '🎯 Ambitious: $1000', value: 1000 },
        { name: '🎯 Custom Amount', value: 'custom' }
      ]
    });

    if (goal === 'custom') {
      const { customGoal } = await inquirer.prompt({
        type: 'number',
        name: 'customGoal',
        message: 'Enter your custom monthly goal ($):',
        validate: (input: number) => 
          input > 0 || 'Please enter a positive amount'
      });
      this.gameState.financialGoal.targetAmount = customGoal;
    } else {
      this.gameState.financialGoal.targetAmount = goal;
    }

    // Set timeframe
    const { timeframe } = await inquirer.prompt({
      type: 'list',
      name: 'timeframe',
      message: 'What\'s your target timeframe?',
      choices: [
        { name: '📅 Weekly', value: 'week' },
        { name: '📅 Monthly', value: 'month' },
        { name: '📅 Yearly', value: 'year' }
      ]
    });
    this.gameState.financialGoal.timeframe = timeframe;
  }

  async handleRiskTolerance(): Promise<void> {
    const { risk } = await inquirer.prompt({
      type: 'list',
      name: 'risk',
      message: 'How much risk are you comfortable with?',
      choices: [
        { 
          name: '🛡️ Low Risk (0-10% potential loss)',
          value: 'low'
        },
        { 
          name: '⚖️ Medium Risk (10-25% potential loss)',
          value: 'medium'
        },
        { 
          name: '🎲 High Risk (25%+ potential loss)',
          value: 'high'
        }
      ]
    });
    this.gameState.financialGoal.riskTolerance = risk;
  }

  private async handleInitialPortfolio(): Promise<void> {
    const { hasPortfolio } = await inquirer.prompt({
      type: 'confirm',
      name: 'hasPortfolio',
      message: 'Do you already have a DeFi portfolio?',
      default: false
    });

    if (hasPortfolio) {
      const { initialBalance } = await inquirer.prompt({
        type: 'number',
        name: 'initialBalance',
        message: 'What\'s your current portfolio value ($)?',
        validate: (input: number) => 
          input >= 0 || 'Please enter a valid amount'
      });
      this.gameState.portfolio.totalBalance = initialBalance;
    } else {
      await this.uiManager.showSuccess(
        'No problem! We\'ll help you build your first DeFi portfolio from scratch.'
      );
    }
  }

  async handleDialogTrigger(trigger: string): Promise<void> {
    switch (trigger) {
      case 'portfolio_analysis':
        await this.handlePortfolioAnalysis();
        break;
      case 'risk_assessment':
        await this.handleRiskAssessment();
        break;
      case 'strategy_recommendation':
        await this.handleStrategyRecommendation();
        break;
      case 'agent_management':
        await this.handleAgentManagement();
        break;
      default:
        await this.uiManager.showError(`Unknown dialog trigger: ${trigger}`);
    }
  }

  private async handlePortfolioAnalysis(): Promise<void> {
    // Show loading message
    console.log('🔍 Analyzing your portfolio...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (this.gameState.portfolio.assets.length === 0) {
      console.log('📊 Portfolio Analysis:');
      console.log('- No assets detected');
      console.log('- Ready to start your DeFi journey!');
    } else {
      // Show portfolio analysis based on actual assets
      await this.uiManager.showPortfolio(this.gameState.portfolio);
    }
  }

  private async handleRiskAssessment(): Promise<void> {
    // Implement risk assessment dialog
    console.log('🛡️ Risk Assessment in progress...');
  }

  private async handleStrategyRecommendation(): Promise<void> {
    // Implement strategy recommendation dialog
    console.log('💡 Generating personalized strategies...');
  }

  async handleAgentManagement() {
    while (true) {
      const { action } = await this.uiManager.showAgentManagement(
        this.gameEngine.getActiveAgents(),
        this.gameEngine.getAvailableAgents(),
        this.gameState.portfolio.totalBalance
      );

      try {
        switch (action) {
          case 'hire':
            const { agentId: hireId } = await this.uiManager.showAgentHiring(
              this.gameEngine.getAvailableAgents(),
              this.gameState.portfolio.totalBalance
            );
            
            if (hireId === 'back') break;
            
            const hireResult = this.gameEngine.hireAgent(hireId);
            await this.uiManager.showSuccess(hireResult);
            break;

          case 'fire':
            const { agentId: fireId } = await this.uiManager.showAgentDismissal(
              this.gameEngine.getActiveAgents()
            );
            
            if (fireId === 'back') break;
            
            const fireResult = this.gameEngine.fireAgent(fireId);
            await this.uiManager.showSuccess(fireResult);
            break;

          case 'back':
            return;
        }
      } catch (error) {
        if (error instanceof Error) {
          await this.uiManager.showError(error.message);
        }
      }
    }
  }
} 