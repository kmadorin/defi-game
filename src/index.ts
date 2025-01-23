import { GameState } from './types';
import { initializeDB } from './utils/db';
import { GameEngine } from './models/GameEngine';
import { UIManager } from './ui/UIManager';
import { DialogManager } from './models/DialogManager';

async function startGame() {
  // Initialize core systems
  const db = await initializeDB();
  await db.read(); // Load initial state
  
  const uiManager = new UIManager();
  const gameEngine = new GameEngine(db.data);
  const dialogManager = new DialogManager(db.data, uiManager);
  
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
      await uiManager.showError(error.message);
    }
  }
}

async function handleDailyUpdate(
  gameEngine: GameEngine,
  db: any,
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
      const agentAction = await uiManager.showAgentManagement(
        gameState.activeAgents,
        [] // TODO: Get available agents from game engine
      );
      
      if (agentAction === 'hire') {
        // TODO: Implement agent hiring
        await uiManager.showSuccess('Agent hired successfully!');
      } else if (agentAction === 'fire') {
        // TODO: Implement agent firing
        const confirmed = await uiManager.confirmAction('Are you sure you want to dismiss this agent?');
        if (confirmed) {
          await uiManager.showSuccess('Agent dismissed.');
        }
      }
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

// Start the game
startGame().catch(async error => {
  const uiManager = new UIManager();
  await uiManager.showError(`Game crashed: ${error.message}`);
}); 