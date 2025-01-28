import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { GameState, Player, Portfolio, Progress } from '../types';
import path from 'path';

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

export class GameDB {
  private _db: Low<GameState>;
  private static instance: GameDB;
  private readonly stateDir = 'game-state';
  private readonly mainStateFile = 'main.json';

  private constructor() {
    const statePath = path.join(this.stateDir, this.mainStateFile);
    const adapter = new JSONFile<GameState>(statePath);
    this._db = new Low(adapter, defaultData);
  }

  static getInstance(): GameDB {
    if (!GameDB.instance) {
      GameDB.instance = new GameDB();
    }
    return GameDB.instance;
  }

  get data(): GameState {
    return this._db.data;
  }

  set data(value: GameState) {
    this._db.data = value;
  }

  async read(): Promise<void> {
    await this._db.read();
    // Initialize with defaults if empty
    if (!this._db.data) {
      this._db.data = defaultData;
    }
  }

  async write(): Promise<void> {
    await this._db.write();
  }

  async initialize(): Promise<void> {
    await this.read();
    
    // Ensure all required fields exist
    this._db.data = {
      ...defaultData,
      ...this._db.data,
      player: {
        ...defaultPlayer,
        ...this._db.data?.player
      },
      portfolio: {
        ...defaultPortfolio,
        ...this._db.data?.portfolio
      },
      progress: {
        ...defaultProgress,
        ...this._db.data?.progress
      }
    };
    
    await this.write();
  }

  async updateField<K extends keyof GameState>(
    field: K,
    value: GameState[K]
  ): Promise<void> {
    this._db.data = {
      ...this._db.data,
      [field]: value
    };
    await this.write();
  }

  async resetGame(): Promise<void> {
    this._db.data = { ...defaultData };
    await this.write();
  }

  async backup(): Promise<void> {
    const timestamp = Date.now();
    const backupPath = path.join(this.stateDir, `backup-${timestamp}.json`);
    const backupAdapter = new JSONFile<GameState>(backupPath);
    const backupDb = new Low(backupAdapter, this._db.data);
    await backupDb.write();
  }
}

export function initializeDB(): GameDB {
  return GameDB.getInstance();
} 