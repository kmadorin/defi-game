import { GameState, DailyReport, Agent } from '../types/index.js';
import { UserManager } from './UserManager.js';
import { mockAgents, marketConditions } from '../data/mockData.js';

export class GameEngine {
  private gameState: GameState;
  private userManager: UserManager;
  private activeAgents: Agent[];
  private marketCondition: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  private dailyReport: string[] = [];

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.userManager = new UserManager(gameState);
    this.activeAgents = this.initializeAgents();
  }

  private initializeAgents(): Agent[] {
    // Start with basic agents based on user level
    const initialAgents = mockAgents.filter(agent => 
      agent.type === 'manager' || agent.type === 'risk-analyst'
    );
    return initialAgents;
  }

  async processDay(): Promise<DailyReport> {
    // Update market conditions periodically
    this.updateMarketConditions();

    // Calculate agent effects
    const effects = this.calculateAgentEffects();

    // Calculate daily earnings with agent effects
    const dailyEarnings = this.calculateDailyEarnings(effects);
    await this.userManager.updatePlayerProgress(dailyEarnings);

    // Generate agent updates
    const agentUpdates = this.generateAgentUpdates();

    // Detect risks with agent effects
    const risks = this.detectRisks(effects);

    // Generate new strategies
    const strategies = this.generateNewStrategies();

    // Process monthly costs and warnings
    if (this.gameState.currentDay % 30 === 0) {
      try {
        const cost = this.processMonthlyCosts();
        this.addToDailyReport(`Agent costs: -$${cost}`);
      } catch (error) {
        if (error instanceof Error) {
          this.addToDailyReport(error.message);
        }
      }
      // Add cost warning if needed
      this.addAgentCostWarning();
    }

    return {
      date: new Date(),
      earnings: dailyEarnings,
      risksDetected: risks,
      newStrategies: strategies,
      agentUpdates: agentUpdates,
      portfolioSnapshot: {
        totalValue: this.gameState.portfolio.totalBalance,
        dayChange: this.calculateDayChange(),
        topPerformers: this.getTopPerformers()
      }
    };
  }

  private updateMarketConditions() {
    // Randomly change market conditions every few days
    if (Math.random() < 0.1) { // 10% chance each day
      const conditions = ['bullish', 'bearish', 'neutral'] as const;
      this.marketCondition = conditions[Math.floor(Math.random() * conditions.length)];
    }
  }

  private calculateDailyEarnings(effects: ReturnType<typeof this.calculateAgentEffects>): number {
    let baseEarnings = 0;
    
    // Calculate earnings from each asset
    this.gameState.portfolio.assets.forEach(asset => {
      const assetReturn = this.calculateAssetReturn(asset);
      baseEarnings += assetReturn;
    });

    // Apply market condition multipliers
    const condition = marketConditions[this.marketCondition];
    if (this.marketCondition === 'bullish' && 'yieldBonus' in condition) {
      baseEarnings *= condition.yieldBonus;
    } else if (this.marketCondition === 'bearish' && 'yieldPenalty' in condition) {
      baseEarnings *= condition.yieldPenalty;
    }

    // Apply agent effects
    baseEarnings *= effects.apyMultiplier;

    return baseEarnings;
  }

  private calculateAssetReturn(asset: any): number {
    // Mock implementation - replace with real calculations
    const baseAPY = asset.type === 'lp' ? 0.15 : 0.08; // 15% for LP, 8% for tokens
    const dailyRate = baseAPY / 365;
    return asset.value * dailyRate;
  }

  private calculateDayChange(): number {
    // Mock implementation - replace with real calculations
    return (Math.random() * 10) - 5; // Random change between -5% and +5%
  }

  private getTopPerformers(): string[] {
    // Return top performing assets
    return this.gameState.portfolio.assets
      .sort((a, b) => this.calculateAssetReturn(b) - this.calculateAssetReturn(a))
      .slice(0, 3)
      .map(asset => asset.name);
  }

  private detectRisks(effects: ReturnType<typeof this.calculateAgentEffects>): string[] {
    const risks: string[] = [];
    const riskScore = this.userManager.calculateRiskScore(this.gameState.portfolio);
    
    // Apply risk reduction from agents
    const adjustedRiskScore = riskScore * (1 - effects.riskReduction);

    if (adjustedRiskScore > 7) {
      risks.push("High portfolio risk detected - consider diversifying");
    }
    if (this.marketCondition === 'bearish') {
      risks.push("Bearish market conditions - consider defensive positions");
    }
    
    return risks;
  }

  private generateNewStrategies(): string[] {
    const condition = marketConditions[this.marketCondition];
    return condition.recommendedStrategies.map(strategy => 
      `Consider ${strategy} in current ${this.marketCondition} market`
    );
  }

  private generateAgentUpdates(): string[] {
    const updates = this.activeAgents.map(agent => {
      switch (agent.type) {
        case 'manager':
          return this.userManager.suggestNextAction();
        case 'risk-analyst':
          return `Risk Analysis: Portfolio risk score is ${this.userManager.calculateRiskScore(this.gameState.portfolio)}/10`;
        case 'yield-bot':
          return `Yield Bot: Scanning for optimal yield opportunities...`;
        case 'news-aggregator':
          return `News Bot: Monitoring market trends and updates...`;
        default:
          return `${agent.type}: Monitoring market conditions...`;
      }
    });

    // Add cost reminders
    const totalMonthlyCost = this.activeAgents.reduce((sum, a) => sum + a.cost, 0);
    const daysUntilPayment = 30 - (this.gameState.currentDay % 30);
    
    if (daysUntilPayment <= 3 && this.activeAgents.length > 0) {
      updates.push(`⚠️ Agent payment due in ${daysUntilPayment} days: $${totalMonthlyCost}`);
      
      if (this.gameState.portfolio.totalBalance < totalMonthlyCost) {
        updates.push(`❗ Warning: Insufficient funds for upcoming agent payments`);
      }
    }

    return updates;
  }

  private addAgentCostWarning() {
    const totalMonthlyCost = this.activeAgents.reduce((sum, a) => sum + a.cost, 0);
    const monthlyIncome = this.calculateAverageMonthlyIncome();
    
    if (totalMonthlyCost > monthlyIncome * 0.5) {
      this.addToDailyReport(`⚠️ Agent costs (${totalMonthlyCost}) exceed 50% of monthly income (${monthlyIncome})`);
    }
  }

  private calculateAverageMonthlyIncome(): number {
    // Calculate average daily earnings over the last 30 days
    const dailyAverage = this.gameState.portfolio.history
      .slice(-30)
      .reduce((sum, tx) => sum + (tx.type === 'deposit' ? tx.value : 0), 0) / 30;
    
    return dailyAverage * 30;
  }

  // Public methods for game interactions
  getAvailableAgents(): Agent[] {
    return mockAgents.filter(agent => {
      const isActive = this.activeAgents.some(a => a.id === agent.id);
      const meetsLevel = parseInt(this.gameState.player.level) >= agent.unlockedAtLevel;
      
      if (isActive) return false;
      if (!meetsLevel) {
        return { ...agent, status: 'locked' as const };
      }
      return { ...agent, status: 'available' as const };
    });
  }

  getActiveAgents(): Agent[] {
    return this.activeAgents;
  }

  hireAgent(agentId: string): string {
    const agent = mockAgents.find(a => a.id === agentId);
    
    if (!agent) throw new Error("Agent not found");
    if (this.gameState.portfolio.totalBalance < agent.cost) 
      throw new Error("Insufficient funds");
    if (parseInt(this.gameState.player.level) < agent.unlockedAtLevel)
      throw new Error("Level requirement not met");
    if (this.activeAgents.some(a => a.id === agentId))
      throw new Error("Agent already hired");
    
    const newAgent: Agent = { 
      ...agent, 
      status: 'active',
      hiredAt: this.gameState.currentDay
    };
    
    this.activeAgents.push(newAgent);
    this.gameState.portfolio.totalBalance -= agent.cost;
    
    return `Hired ${agent.type} for $${agent.cost}/month`;
  }

  fireAgent(agentId: string): string {
    const index = this.activeAgents.findIndex(a => a.id === agentId);
    if (index === -1) throw new Error("Agent not active");
    
    const agent = this.activeAgents[index];
    this.activeAgents.splice(index, 1);
    
    return `Dismissed ${agent.type}`;
  }

  processMonthlyCosts(): number {
    const totalCost = this.activeAgents.reduce((sum, a) => sum + a.cost, 0);
    this.gameState.portfolio.totalBalance -= totalCost;
    
    // Check if we can still afford agents
    if (this.gameState.portfolio.totalBalance < 0) {
      const firedAgents = this.activeAgents.map(a => a.type);
      this.activeAgents = [];
      throw new Error(`Insufficient funds to pay agents: ${firedAgents.join(', ')} have been dismissed`);
    }
    
    return totalCost;
  }

  private calculateAgentEffects() {
    return this.activeAgents.reduce((effects, agent) => {
      switch(agent.type) {
        case 'news-aggregator':
          effects.apyMultiplier += 0.05; // 5% APY boost
          break;
        case 'yield-bot':
          effects.automationSpeed += 2;
          effects.apyMultiplier += 0.03; // 3% APY boost
          break;
        case 'risk-analyst':
          effects.riskReduction += 0.15; // 15% risk reduction
          break;
        case 'manager':
          effects.apyMultiplier += 0.02; // 2% APY boost
          effects.riskReduction += 0.05; // 5% risk reduction
          break;
      }
      return effects;
    }, { 
      apyMultiplier: 1, 
      automationSpeed: 1,
      riskReduction: 0 
    });
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getUserManager(): UserManager {
    return this.userManager;
  }

  private addToDailyReport(message: string) {
    this.dailyReport.push(message);
  }
} 