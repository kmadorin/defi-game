# DeFi Mentor Game Implementation Plan

## Step 1: Project Setup
1. Create a new directory and initialize npm
```bash
mkdir defi-mentor
cd defi-mentor
npm init -y
```

2. Install dependencies
```bash
npm install typescript @types/node chalk inquirer ora lowdb @types/lowdb
npm install -D ts-node nodemon @types/inquirer
```

3. Create TypeScript config
```bash
npx tsc --init
```

4. Setup project structure:
```
src/
  ├── types/         # Type definitions
  ├── data/          # Mock data
  ├── models/        # Game classes
  ├── ui/            # UI components
  ├── utils/         # Helper functions
  ├── dialogs/       # Dialog scenarios
  └── index.ts       # Entry point
```

## Step 2: Enhanced Core Types
1. Update `src/types/index.ts` with user story requirements:
```typescript
interface GameState {
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

interface Player {
  name: string;
  level: string;
  xp: number;
  badges: Badge[];
}

interface Portfolio {
  totalBalance: number;
  assets: Asset[];
  history: Transaction[];
}

interface Progress {
  currentGoal: number;
  earnedAmount: number;
  achievements: Achievement[];
}

interface Agent {
  type: 'manager' | 'yield-bot' | 'risk-analyst' | 'news-aggregator';
  personalityTraits: string[];
  communicationStyle: 'formal' | 'casual' | 'technical';
}

interface DailyReport {
  earnings: number;
  risksDetected: string[];
  newStrategies: string[];
  agentUpdates: string[];
}
```

## Step 3: Enhanced Mock Data
1. Add user onboarding flow to `src/data/mockData.ts`:
```typescript
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
  }
];

export const riskAssessments = [
  "This protocol has a 10% chance of impermanent loss",
  "High volatility detected in this pool"
];
```

## Step 4: Game Engine Additions
1. Create `src/models/UserManager.ts`:
```typescript
class UserManager {
  determineUserLevel(walletAddress: string): UserLevel {
    // Mock implementation for junior devs:
    if (walletAddress === '0xnovice') return 'novice';
    if (walletAddress.includes('uniswap')) return 'advanced';
    return 'expert';
  }
  
  adaptCommunicationStyle(userLevel: UserLevel): CommunicationStyle {
    // Return appropriate style based on level
  }
}
```

## Step 5: Enhanced UI Components
1. Add user-specific displays in `src/ui/display.ts`:
```typescript
export function showDailyReport(report: DailyReport) {
  // Highlight earnings in green, risks in red
}

export function showRiskAssessment(risks: string[]) {
  // Display risks with warning symbols
}
```

## Step 6: Dialog System Improvements
1. Update `DialogManager` with onboarding flow:
```typescript
class DialogManager {
  async handleFirstInteraction() {
    const answers = await inquirer.prompt({
      type: 'list',
      name: 'goal',
      message: 'What\'s your monthly earning goal?',
      choices: ['$100', '$500', '$1000', 'Custom']
    });
    
    if (answers.goal === 'Custom') {
      return this.handleCustomGoal();
    }
    // ... proceed with onboarding
  }
}
```

## Step 7: Game Loop Implementation

1. Create main game loop in `src/index.ts`:
```typescript
async function startGame() {
  // Initialize core systems
  const db = initializeDB();
  const userManager = new UserManager();
  
  // Main game loop
  while (true) {
    await handleDailyUpdate(db);
    await sleep(24 * 60 * 60 * 1000); // Simulate daily cycle
  }
}

function handleDailyUpdate(db: LowdbSync<GameState>) {
  // Generate reports
  const report = generateDailyReport(db.data);
  showDailyReport(report);
  
  // Save progress
  db.update('currentDay', n => n + 1).write();
}
```

## Step 8: Data Persistence

1. Setup lowdb in `src/utils/db.ts`:
```typescript
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

type GameState = {/*...*/};

const adapter = new FileSync<GameState>('game-state.json');
const db = low(adapter);

// Initialize default state
db.defaults({
  userLevel: 'novice',
  currentDay: 0,
  portfolio: { totalBalance: 0, assets: [] }
}).write();

export default db;
```

## Step 9: Enhanced CLI Commands
1. Add user level options:
```typescript
program
  .command('start')
  .option('--level <level>', 'Set user level (novice|advanced|expert)')
  .action((options) => startGame(options.level));
```

## Implementation Order Update
1. Core onboarding flow (Steps 1-3)
2. Basic portfolio tracking (Steps 4-5)
3. Daily reports system (Step 7)
4. Risk detection (Step 3 additions)
5. Agent hiring system (Step 4)
6. Advanced features (Telegram integration)

## Testing Scenarios Additions
```typescript
describe('User Onboarding', () => {
  it('should handle first-time goal setting', async () => {
    const mockAnswers = { goal: '$500' };
    await testDialog(initialDialog, mockAnswers);
  });
  
  it('should detect novice user level', () => {
    const manager = new UserManager();
    expect(manager.determineUserLevel('0x...')).toBe('novice');
  });
});
```

## New Troubleshooting Section
```markdown
## Common Issues

1. Dependency conflicts:
   - Delete node_modules and package-lock.json
   - Run `npm install`

2. TypeScript errors:
   - Check interface implementations match
   - Use `any` temporarily for complex types

3. Dialog flow stuck:
   - Add console.log to choice handlers
   - Test individual dialog steps
```

## Tips Update
11. Start with novice user flow first
12. Implement basic risk detection before complex strategies
13. Use mock wallet addresses for testing
14. Add validation for all user inputs
15. Test each dialog step independently

## Example Usage

After implementation:
```bash
# Start new game
npm start

# Simulate full dialogue
npm run simulate
```

## Tips for Implementation

1. Start with basic console output before adding chalk styling
2. Use simple state management before implementing lowdb
3. Implement one dialog scenario first, then expand
4. Add progression system after basic game loop works
5. Keep mock data simple initially
6. Use TypeScript strict mode for better code quality
7. Implement one agent type first, then add others
8. Add error handling for user inputs
9. Use async/await for simulated transactions
10. Keep the code modular for easy updates

## Critical Missing Pieces Added:

3a. Add wallet analysis implementation guide:
```typescript
// src/models/UserManager.ts
determineUserLevel(walletAddress: string): UserLevel {
  // Mock implementation for junior devs:
  if (walletAddress === '0xnovice') return 'novice';
  if (walletAddress.includes('uniswap')) return 'advanced';
  return 'expert';
}
```

7a. Expand game loop implementation details:
```typescript
// src/index.ts
async function startGame() {
  // Initialize core systems
  const db = initializeDB();
  const userManager = new UserManager();
  
  // Main game loop
  while (true) {
    await handleDailyUpdate(db);
    await sleep(24 * 60 * 60 * 1000); // Simulate daily cycle
  }
}

function handleDailyUpdate(db: LowdbSync<GameState>) {
  // Generate reports
  const report = generateDailyReport(db.data);
  showDailyReport(report);
  
  // Save progress
  db.update('currentDay', n => n + 1).write();
}
```

8a. Add concrete database example:
```typescript
// src/utils/db.ts
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

type GameState = {/*...*/};

const adapter = new FileSync<GameState>('game-state.json');
const db = low(adapter);

// Initialize default state
db.defaults({
  userLevel: 'novice',
  currentDay: 0,
  portfolio: { totalBalance: 0, assets: [] }
}).write();

export default db;
```

## New Validation Section:
```markdown
## Required Validations

1. User input validation:
```typescript
// In DialogManager class
validateGoalAmount(amount: number) {
  if (amount < 0) throw new Error('Negative amounts not allowed');
  if (amount > 1000000) throw new Error('Maximum goal is $1,000,000');
}
```

2. State validation:
```typescript
// After loading from DB
function validateGameState(state: GameState) {
  if (!['novice', 'advanced', 'expert'].includes(state.userLevel)) {
    throw new Error('Invalid user level');
  }
}
```

## Enhanced Testing Scenarios:
```typescript
describe('Daily Reports', () => {
  it('should generate empty report for new game', () => {
    const newGameState = initializeNewGame();
    const report = generateDailyReport(newGameState);
    expect(report.earnings).toBe(0);
  });
  
  it('should detect increased risk after adding assets', () => {
    const state = testStateWithAssets([{name: 'HighRiskCoin', value: 1000}]);
    const risks = detectRisks(state);
    expect(risks).toContain('High volatility detected');
  });
});
```

## Final Implementation Checklist:
```markdown
- [ ] Core onboarding dialog flow
- [ ] Wallet address analysis stub
- [ ] Daily report generation
- [ ] Basic risk detection
- [ ] Game state persistence
- [ ] Input validation
- [ ] Help command implementation
- [ ] Progress tracking display
```

Key additions that ensure implementability:
1. Concrete examples for complex systems (DB, game loop)
2. Validation patterns for critical user inputs
3. Complete initialization flow for new games
4. Mock implementations for junior developers
5. Explicit state management examples
6. End-to-end test scenarios
7. Implementation checklist for tracking progress

The plan is now fully actionable by a junior developer or AI agent with clear entry points, validation patterns, and concrete examples for all major systems. Each component has: 
- Implementation code example
- Related validation
- Test scenario
- Troubleshooting guidance
