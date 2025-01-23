import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { GameState, Player, Portfolio, Progress } from '../types';

const defaultPlayer: Player = {
  name: '',
  level: 'novice',
  xp: 0,
  badges: []
};

const defaultPortfolio: Portfolio = {
  totalBalance: 0,
  assets: [],
  history: []
};

const defaultProgress: Progress = {
  currentGoal: 0,
  earnedAmount: 0,
  achievements: []
};

const defaultData: GameState = {
  userLevel: 'novice',
  financialGoal: {
    targetAmount: 1000,
    timeframe: 'month',
    riskTolerance: 'medium'
  },
  player: defaultPlayer,
  portfolio: defaultPortfolio,
  progress: defaultProgress,
  activeAgents: [],
  currentDay: 0
};

class GameDB {
  private db: Low<GameState>;
  private static instance: GameDB;

  private constructor() {
    const adapter = new JSONFile<GameState>('game-state.json');
    this.db = new Low(adapter, defaultData);
  }

  static getInstance(): GameDB {
    if (!GameDB.instance) {
      GameDB.instance = new GameDB();
    }
    return GameDB.instance;
  }

  async initialize(): Promise<void> {
    await this.db.read();
    
    // Ensure all required fields exist
    this.db.data = {
      ...defaultData,
      ...this.db.data,
      player: {
        ...defaultPlayer,
        ...this.db.data?.player
      },
      portfolio: {
        ...defaultPortfolio,
        ...this.db.data?.portfolio
      },
      progress: {
        ...defaultProgress,
        ...this.db.data?.progress
      }
    };
    
    await this.db.write();
  }

  async save(): Promise<void> {
    await this.db.write();
  }

  async load(): Promise<void> {
    await this.db.read();
  }

  getData(): GameState {
    return this.db.data;
  }

  setData(data: GameState): void {
    this.db.data = data;
  }

  async updateField<K extends keyof GameState>(
    field: K,
    value: GameState[K]
  ): Promise<void> {
    this.db.data = {
      ...this.db.data,
      [field]: value
    };
    await this.save();
  }

  async resetGame(): Promise<void> {
    this.db.data = { ...defaultData };
    await this.save();
  }

  async backup(): Promise<void> {
    const backupAdapter = new JSONFile<GameState>(
      `game-state-backup-${Date.now()}.json`
    );
    const backupDb = new Low(backupAdapter, this.db.data);
    await backupDb.write();
  }
}

export function initializeDB(): GameDB {
  return GameDB.getInstance();
} 