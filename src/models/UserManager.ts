import { Player, GameState } from '../types/index.js';
import { mockStrategies, educationalContent } from '../data/mockData.js';

type UserLevel = 'novice' | 'advanced' | 'expert';
type CommunicationStyle = 'formal' | 'casual' | 'technical';
type RiskTolerance = 'low' | 'medium' | 'high';

export class UserManager {
  private player: Player;
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.player = gameState.player;
  }

  determineUserLevel(walletAddress: string): UserLevel {
    if (walletAddress === '0xnovice') return 'novice';
    if (walletAddress.includes('uniswap')) return 'advanced';
    return 'expert';
  }
  
  adaptCommunicationStyle(userLevel: UserLevel): CommunicationStyle {
    switch (userLevel) {
      case 'novice':
        return 'casual';
      case 'advanced':
        return 'technical';
      case 'expert':
        return 'formal';
      default:
        return 'casual';
    }
  }

  getRecommendedStrategies(riskTolerance: RiskTolerance) {
    return mockStrategies.filter(strategy => {
      if (riskTolerance === 'low' && strategy.riskLevel === 'low') return true;
      if (riskTolerance === 'medium' && ['low', 'medium'].includes(strategy.riskLevel)) return true;
      if (riskTolerance === 'high') return true;
      return false;
    });
  }

  async updatePlayerProgress(earnedAmount: number) {
    this.player.xp += Math.floor(earnedAmount / 10); // 1 XP per $10 earned
    await this.checkLevelUp();
    this.gameState.progress.earnedAmount += earnedAmount;
  }

  private async checkLevelUp() {
    const xpThresholds = {
      novice: 0,
      advanced: 1000,
      expert: 5000
    };

    if (this.player.xp >= xpThresholds.expert && this.player.level !== 'expert') {
      this.player.level = 'expert';
      await this.awardBadge('expert_achieved');
    } else if (this.player.xp >= xpThresholds.advanced && this.player.level !== 'advanced') {
      this.player.level = 'advanced';
      await this.awardBadge('advanced_achieved');
    }
  }

  private async awardBadge(badgeId: string) {
    const badge = {
      id: badgeId,
      name: this.getBadgeName(badgeId),
      description: this.getBadgeDescription(badgeId),
      dateEarned: new Date()
    };
    this.player.badges.push(badge);
  }

  private getBadgeName(badgeId: string): string {
    const badges = {
      'expert_achieved': '🎓 DeFi Expert',
      'advanced_achieved': '📈 Advanced Trader',
      'first_trade': '🎯 First Trade',
      'high_yield': '💰 Yield Master',
      'risk_manager': '🛡️ Risk Manager'
    };
    return badges[badgeId as keyof typeof badges] || 'Unknown Badge';
  }

  private getBadgeDescription(badgeId: string): string {
    const descriptions = {
      'expert_achieved': 'Reached expert level status in DeFi trading',
      'advanced_achieved': 'Progressed to advanced trading capabilities',
      'first_trade': 'Completed your first successful trade',
      'high_yield': 'Achieved over 20% APY on a position',
      'risk_manager': 'Successfully managed high-risk positions'
    };
    return descriptions[badgeId as keyof typeof descriptions] || 'Badge description not found';
  }

  getEducationalContent() {
    return educationalContent[this.player.level === 'expert' ? 'advanced' : 'novice'];
  }

  calculateRiskScore(portfolio: any): number {
    let riskScore = 0;
    
    // Analyze portfolio composition
    portfolio.assets.forEach((asset: any) => {
      if (asset.type === 'lp') riskScore += 2; // LP positions are riskier
      if (asset.type === 'token') riskScore += 1;
      if (asset.protocol === 'Aave') riskScore += 0.5; // Blue chip protocols are safer
    });

    // Factor in portfolio diversity
    const uniqueProtocols = new Set(portfolio.assets.map((a: any) => a.protocol)).size;
    riskScore = riskScore / (uniqueProtocols || 1); // Divide by number of unique protocols

    return Math.min(riskScore, 10); // Cap at 10
  }

  suggestNextAction(): string {
    const { earnedAmount, currentGoal } = this.gameState.progress;
    const progressPercentage = (earnedAmount / currentGoal) * 100;

    if (progressPercentage < 25) {
      return "Consider exploring low-risk yield farming opportunities to build a stable foundation.";
    } else if (progressPercentage < 50) {
      return "You're making good progress! Look into medium-risk opportunities to accelerate your gains.";
    } else if (progressPercentage < 75) {
      return "You're well on your way! Consider diversifying your portfolio with some advanced strategies.";
    } else {
      return "You're almost there! Maintain your current strategy while managing risks carefully.";
    }
  }
} 