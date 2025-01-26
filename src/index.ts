import { GameState } from './types/index.js';
import { initializeDB } from './utils/db.js';
import { GameEngine } from './models/GameEngine.js';
import { UIManager } from './ui/UIManager.js';
import { DialogManager } from './models/DialogManager.js';

export async function startGame(level = 'novice') {
  // Initialize core systems
  const db = await initializeDB();
  await db.initialize(); // Use initialize instead of read
  
  if (level) {
    db.data.userLevel = level as GameState['userLevel'];
  }
  
  const uiManager = new UIManager();
  const gameEngine = new GameEngine(db.data);
  const dialogManager = new DialogManager(db.data, uiManager, gameEngine);
  
  // Check if this is first time running
  if (!db.data.player.name) {
    await dialogManager.handleFirstInteraction();
    // Save initial state after onboarding
    db.data = gameEngine.getGameState();
    await db.write();
  }
  
  console.clear();
  console.log('🎮 Welcome back to DeFi Mentor Game! 🚀');
  
  // Main game loop
  while (true) {
    try {
      // Process daily update in background
      handleDailyUpdate(gameEngine, db, uiManager);
      
      // Show main menu and handle user input
      const action = await uiManager.showMainMenu();
      await handleUserAction(action, gameEngine, uiManager, dialogManager);
      
      // Save state after each action
      db.data = gameEngine.getGameState();
      await db.write();
      
      // Small delay to prevent UI flicker
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      if (error instanceof Error) {
        await uiManager.showError(error.message);
      } else {
        await uiManager.showError('An unknown error occurred');
      }
    }
  }
}

async function handleDailyUpdate(
  gameEngine: GameEngine,
  db: ReturnType<typeof initializeDB>,
  uiManager: UIManager
) {
  // Process daily updates
  const report = await gameEngine.processDay();
  uiManager.showDailyReport(report);
  
  // Save progress
  db.data = gameEngine.getGameState();
  await db.write();
}

async function handleUserAction(
  action: string,
  gameEngine: GameEngine,
  uiManager: UIManager,
  dialogManager: DialogManager
) {
  const gameState = gameEngine.getGameState();
  
  switch (action) {
    case 'portfolio':
      await uiManager.showPortfolio(gameState.portfolio);
      break;
      
    case 'agents':
      await dialogManager.handleAgentManagement();
      break;
      
    case 'strategies':
      await dialogManager.handleDialogTrigger('strategy_recommendation');
      break;
      
    case 'learn':
      const content = gameEngine.getUserManager().getEducationalContent();
      // TODO: Implement learning center UI
      break;
      
    case 'settings':
      const setting = await uiManager.showSettings(gameState);
      if (setting === 'goals') {
        await dialogManager.handleFinancialGoals();
      } else if (setting === 'risk') {
        await dialogManager.handleRiskTolerance();
      }
      break;
      
    default:
      await uiManager.showError('Invalid action selected');
  }
}

// Direct script execution
if (import.meta.url.endsWith(process.argv[1])) {
  startGame().catch(async error => {
    const uiManager = new UIManager();
    if (error instanceof Error) {
      await uiManager.showError(`Game crashed: ${error.message}`);
    } else {
      await uiManager.showError('Game crashed: An unknown error occurred');
    }
  });
} 