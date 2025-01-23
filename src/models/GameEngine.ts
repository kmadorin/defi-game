import { GameState, DailyReport, Agent } from '../types';
import { UserManager } from './UserManager';
import { mockAgents, marketConditions } from '../data/mockData';

export class GameEngine {
  private gameState: GameState;
  private userManager: UserManager;
  private activeAgents: Agent[];
  private marketCondition: 'bullish' | 'bearish' | 'neutral' = 'neutral';

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

    // Calculate daily earnings
    const dailyEarnings = this.calculateDailyEarnings();
    await this.userManager.updatePlayerProgress(dailyEarnings);

    // Generate agent updates
    const agentUpdates = this.generateAgentUpdates();

    // Detect risks
    const risks = this.detectRisks();

    // Generate new strategies
    const strategies = this.generateNewStrategies();

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

  private calculateDailyEarnings(): number {
    let baseEarnings = 0;
    
    // Calculate earnings from each asset
    this.gameState.portfolio.assets.forEach(asset => {
      const assetReturn = this.calculateAssetReturn(asset);
      baseEarnings += assetReturn;
    });

    // Apply market condition multipliers
    const condition = marketConditions[this.marketCondition];
    if (this.marketCondition === 'bullish' && condition.yieldBonus) {
      baseEarnings *= condition.yieldBonus;
    } else if (this.marketCondition === 'bearish' && condition.yieldPenalty) {
      baseEarnings *= condition.yieldPenalty;
    }

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

  private detectRisks(): string[] {
    const risks: string[] = [];
    const riskScore = this.userManager.calculateRiskScore(this.gameState.portfolio);

    if (riskScore > 7) {
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
    return this.activeAgents.map(agent => {
      switch (agent.type) {
        case 'manager':
          return this.userManager.suggestNextAction();
        case 'risk-analyst':
          return `Risk Analysis: Portfolio risk score is ${this.userManager.calculateRiskScore(this.gameState.portfolio)}/10`;
        case 'yield-bot':
          return `Yield Bot: Scanning for optimal yield opportunities...`;
        default:
          return `${agent.type}: Monitoring market conditions...`;
      }
    });
  }

  // Public methods for game interactions
  hireAgent(agentType: Agent['type']) {
    const newAgent = mockAgents.find(a => a.type === agentType && 
      !this.activeAgents.some(active => active.type === agentType));
    if (newAgent) {
      this.activeAgents.push(newAgent);
    }
  }

  fireAgent(agentId: string) {
    this.activeAgents = this.activeAgents.filter(agent => agent.id !== agentId);
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getUserManager(): UserManager {
    return this.userManager;
  }
} 