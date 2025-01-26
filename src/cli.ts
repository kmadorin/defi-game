#!/usr/bin/env node
import { Command } from 'commander';
import { startGame } from './index.js';
import { GameDB } from './utils/db.js';
import { UIManager } from './ui/UIManager.js';

const program = new Command();

program
  .name('defi-mentor')
  .description('DeFi Mentor Game - Learn DeFi by playing!')
  .version('1.0.0');

program
  .command('start')
  .description('Start the DeFi Mentor game')
  .option('--level <level>', 'Set initial user level (novice|advanced|expert)', 'novice')
  .option('--reset', 'Reset game progress and start fresh', false)
  .action(async (options) => {
    const db = GameDB.getInstance();
    const uiManager = new UIManager();

    if (options.reset) {
      const confirmed = await uiManager.confirmAction(
        'Are you sure you want to reset all progress? This cannot be undone.'
      );
      if (confirmed) {
        await db.resetGame();
        console.log('Game progress reset successfully.');
      } else {
        console.log('Reset cancelled.');
        return;
      }
    }

    // Create backup before starting
    await db.backup();
    
    // Start the game
    await startGame(options.level);
  });

program
  .command('backup')
  .description('Create a backup of current game state')
  .action(async () => {
    const db = GameDB.getInstance();
    await db.backup();
    console.log('Backup created successfully.');
  });

program
  .command('reset')
  .description('Reset all game progress')
  .action(async () => {
    const db = GameDB.getInstance();
    const uiManager = new UIManager();
    
    const confirmed = await uiManager.confirmAction(
      'Are you sure you want to reset all progress? This cannot be undone.'
    );
    
    if (confirmed) {
      await db.resetGame();
      console.log('Game progress reset successfully.');
    } else {
      console.log('Reset cancelled.');
    }
  });

program.parse(); 