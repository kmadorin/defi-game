export interface GameState {
  userLevel: 'novice' | 'advanced' | 'expert';
  financialGoal: {
    targetAmount: number;
    timeframe: 'week' | 'month' | 'year';
    riskTolerance: 'low' | 'medium' | 'high';
  };
  player: Player;
  portfolio: Portfolio;
  progress: Progress;
  activeAgents: Agent[];
  currentDay: number;
}

export interface Player {
  name: string;
  level: string;
  xp: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  dateEarned: Date;
}

export interface Portfolio {
  totalBalance: number;
  assets: Asset[];
  history: Transaction[];
}

export interface Asset {
  id: string;
  name: string;
  amount: number;
  value: number;
  type: 'token' | 'lp' | 'nft';
  protocol?: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'swap' | 'deposit' | 'withdraw';
  asset: string;
  amount: number;
  value: number;
  timestamp: Date;
}

export interface Progress {
  currentGoal: number;
  earnedAmount: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  dateCompleted: Date;
}

export interface Agent {
  id: string;
  type: 'manager' | 'yield-bot' | 'risk-analyst' | 'news-aggregator';
  cost: number;
  unlockedAtLevel: number;
  personalityTraits: string[];
  communicationStyle: 'formal' | 'casual' | 'technical';
  status: 'active' | 'locked' | 'available';
  hiredAt?: number;
}

export interface DailyReport {
  date: Date;
  earnings: number;
  risksDetected: string[];
  newStrategies: string[];
  agentUpdates: string[];
  portfolioSnapshot: {
    totalValue: number;
    dayChange: number;
    topPerformers: string[];
  };
}

export interface DialogChoice {
  name: string;
  value: string | number;
}

export interface DialogStep {
  agent: Agent['type'];
  message: string;
  choices?: string[] | DialogChoice[];
  triggers?: string;
  next?: string;
}

export interface Strategy {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedApy: string;
  requirements: {
    minInvestment: number;
    experience: 'novice' | 'advanced' | 'expert';
  };
}

export interface MarketCondition {
  riskMultiplier: number;
  yieldBonus?: number;
  yieldPenalty?: number;
  yieldMultiplier?: number;
  recommendedStrategies: string[];
}

export interface LearningModule {
  topic: string;
  content: string;
  quiz: Quiz[];
}

export interface Quiz {
  question: string;
  choices: string[];
  correct: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
} 