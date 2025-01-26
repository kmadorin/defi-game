import { Agent, Asset, Transaction, Strategy } from '../types/index.js';

export const initialDialog = [
  {
    agent: "manager",
    message: "Welcome to DeFi Mentor! 🚀 How much do you want to earn in DeFi this month?",
    choices: ["$100", "$500", "$1000", "Custom amount"]
  },
  {
    agent: "manager",
    message: "Great choice! Let's analyze your current portfolio...",
    triggers: "portfolio_analysis"
  },
  {
    agent: "risk-analyst",
    message: "Before we proceed, let's assess your risk tolerance. How comfortable are you with potential losses?",
    choices: ["Conservative (0-10% loss)", "Moderate (10-25% loss)", "Aggressive (25%+ loss)"]
  }
];

export const riskAssessments = [
  "This protocol has a 10% chance of impermanent loss",
  "High volatility detected in this pool",
  "Smart contract risk: Protocol not audited",
  "Market risk: High correlation with BTC price",
  "Liquidity risk: Pool TVL below safety threshold",
  "Protocol risk: Recent governance changes"
];

export const mockStrategies = [
  {
    name: "Stable Yield Farming",
    description: "Provide liquidity to stable pairs for consistent yields",
    riskLevel: "low",
    expectedApy: "5-10%",
    requirements: {
      minInvestment: 100,
      experience: "novice"
    }
  },
  {
    name: "DeFi Blue Chips",
    description: "Stake in top DeFi protocols for moderate returns",
    riskLevel: "medium",
    expectedApy: "10-20%",
    requirements: {
      minInvestment: 500,
      experience: "novice"
    }
  },
  {
    name: "Yield Optimization",
    description: "Autocompounding and yield hopping for maximum returns",
    riskLevel: "high",
    expectedApy: "20-40%",
    requirements: {
      minInvestment: 1000,
      experience: "advanced"
    }
  }
];

export const mockAgents: Agent[] = [
  {
    id: "manager-1",
    type: "manager",
    cost: 100,
    unlockedAtLevel: 1,
    personalityTraits: ["helpful", "patient", "encouraging"],
    communicationStyle: "casual",
    status: "available"
  },
  {
    id: "yield-bot-1",
    type: "yield-bot",
    cost: 75,
    unlockedAtLevel: 2,
    personalityTraits: ["analytical", "precise", "proactive"],
    communicationStyle: "technical",
    status: "locked"
  },
  {
    id: "risk-analyst-1",
    type: "risk-analyst",
    cost: 150,
    unlockedAtLevel: 3,
    personalityTraits: ["cautious", "thorough", "direct"],
    communicationStyle: "formal",
    status: "locked"
  },
  {
    id: "news-bot-1",
    type: "news-aggregator",
    cost: 50,
    unlockedAtLevel: 2,
    personalityTraits: ["informative", "alert", "fast"],
    communicationStyle: "technical",
    status: "locked"
  }
];

export const mockAssets: Asset[] = [
  {
    id: "eth-usdc-lp",
    name: "ETH-USDC LP",
    amount: 1,
    value: 1000,
    type: "lp",
    protocol: "Uniswap"
  },
  {
    id: "aave-usdc",
    name: "aUSDC",
    amount: 500,
    value: 500,
    type: "token",
    protocol: "Aave"
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    type: "deposit",
    asset: "USDC",
    amount: 1000,
    value: 1000,
    timestamp: new Date("2024-03-15")
  },
  {
    id: "tx2",
    type: "swap",
    asset: "USDC/ETH",
    amount: 500,
    value: 500,
    timestamp: new Date("2024-03-16")
  }
];

export const educationalContent = {
  novice: [
    {
      topic: "Understanding Liquidity Pools",
      content: "Liquidity pools are smart contracts that hold token pairs...",
      quiz: [
        {
          question: "What is impermanent loss?",
          choices: [
            "Temporary loss due to price changes",
            "Permanent loss of tokens",
            "Network fees",
            "Smart contract bugs"
          ],
          correct: 0
        }
      ]
    }
  ],
  advanced: [
    {
      topic: "Advanced Yield Farming",
      content: "Leveraged yield farming involves borrowing assets...",
      quiz: [
        {
          question: "What is a flash loan?",
          choices: [
            "A loan that must be repaid in the same transaction",
            "A loan with high interest",
            "A loan without collateral",
            "A loan from multiple lenders"
          ],
          correct: 0
        }
      ]
    }
  ]
};

export const marketConditions = {
  bullish: {
    riskMultiplier: 0.8,
    yieldBonus: 1.2,
    recommendedStrategies: ["Yield Optimization", "DeFi Blue Chips"]
  },
  bearish: {
    riskMultiplier: 1.2,
    yieldPenalty: 0.8,
    recommendedStrategies: ["Stable Yield Farming"]
  },
  neutral: {
    riskMultiplier: 1.0,
    yieldMultiplier: 1.0,
    recommendedStrategies: ["DeFi Blue Chips"]
  }
}; 