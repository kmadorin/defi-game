import chalk from 'chalk';
import inquirer from 'inquirer';
import { DailyReport, GameState, Player, Portfolio, Agent } from '../types';

export class UIManager {
  async showMainMenu(): Promise<string> {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📊 View Portfolio', value: 'portfolio' },
        { name: '💰 View Strategies', value: 'strategies' },
        { name: '🤖 Manage Agents', value: 'agents' },
        { name: '📚 Learning Center', value: 'learn' },
        { name: '⚙️ Settings', value: 'settings' }
      ]
    });
    return action;
  }

  async showPortfolio(portfolio: Portfolio) {
    console.clear();
    console.log(chalk.bold('\n📊 Your Portfolio'));
    console.log('================');
    
    console.log(chalk.cyan(`\nTotal Balance: $${portfolio.totalBalance.toFixed(2)}`));
    
    if (portfolio.assets.length > 0) {
      console.log(chalk.bold('\nAssets:'));
      portfolio.assets.forEach(asset => {
        const valueStr = chalk.green(`$${asset.value.toFixed(2)}`);
        console.log(`  • ${asset.name}: ${asset.amount} tokens (${valueStr})`);
        if (asset.protocol) {
          console.log(`    Protocol: ${chalk.blue(asset.protocol)}`);
        }
      });
    } else {
      console.log(chalk.yellow('\nNo assets yet. Time to start investing!'));
    }

    if (portfolio.history.length > 0) {
      console.log(chalk.bold('\nRecent Transactions:'));
      portfolio.history.slice(-5).forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleDateString();
        const valueStr = chalk.green(`$${tx.value.toFixed(2)}`);
        console.log(`  • ${date}: ${tx.type} ${tx.asset} - ${valueStr}`);
      });
    }
  }

  showDailyReport(report: DailyReport) {
    console.clear();
    console.log(chalk.bold('\n📊 Daily Report'));
    console.log('==============');
    
    // Show earnings with color based on amount
    const earningsColor = report.earnings > 0 ? chalk.green : chalk.red;
    console.log(`\n💰 Earnings: ${earningsColor(`$${report.earnings.toFixed(2)}`)}`);
    
    // Show portfolio snapshot
    console.log(chalk.bold('\n📈 Portfolio Update:'));
    console.log(`  Total Value: $${report.portfolioSnapshot.totalValue.toFixed(2)}`);
    const changeColor = report.portfolioSnapshot.dayChange >= 0 ? chalk.green : chalk.red;
    const changeSymbol = report.portfolioSnapshot.dayChange >= 0 ? '↑' : '↓';
    console.log(`  Day Change: ${changeColor(`${changeSymbol} ${Math.abs(report.portfolioSnapshot.dayChange).toFixed(2)}%`)}`);
    
    if (report.portfolioSnapshot.topPerformers.length > 0) {
      console.log(chalk.bold('\n🌟 Top Performers:'));
      report.portfolioSnapshot.topPerformers.forEach(asset => {
        console.log(`  • ${chalk.green(asset)}`);
      });
    }
    
    // Show risks with warning symbols
    if (report.risksDetected.length > 0) {
      console.log(chalk.bold('\n⚠️  Risks Detected:'));
      report.risksDetected.forEach(risk => {
        console.log(chalk.yellow(`  • ${risk}`));
      });
    }
    
    // Show new strategies
    if (report.newStrategies.length > 0) {
      console.log(chalk.bold('\n💡 Recommended Strategies:'));
      report.newStrategies.forEach(strategy => {
        console.log(chalk.blue(`  • ${strategy}`));
      });
    }
    
    // Show agent updates
    if (report.agentUpdates.length > 0) {
      console.log(chalk.bold('\n🤖 Agent Updates:'));
      report.agentUpdates.forEach(update => {
        console.log(`  • ${update}`);
      });
    }
  }

  async showAgentManagement(activeAgents: Agent[], availableAgents: Agent[]) {
    console.clear();
    console.log(chalk.bold('\n🤖 Agent Management'));
    console.log('=================');

    // Show active agents
    console.log(chalk.bold('\nActive Agents:'));
    activeAgents.forEach(agent => {
      console.log(`  • ${chalk.green(agent.type)} - ${agent.communicationStyle} style`);
      console.log(`    Traits: ${agent.personalityTraits.join(', ')}`);
    });

    // Show available agents
    console.log(chalk.bold('\nAvailable Agents:'));
    availableAgents.forEach(agent => {
      console.log(`  • ${chalk.blue(agent.type)} - ${agent.communicationStyle} style`);
      console.log(`    Traits: ${agent.personalityTraits.join(', ')}`);
    });

    return inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Hire New Agent', value: 'hire' },
        { name: '➖ Dismiss Agent', value: 'fire' },
        { name: '↩️ Back to Main Menu', value: 'back' }
      ]
    });
  }

  async showPlayerStats(player: Player) {
    console.clear();
    console.log(chalk.bold('\n👤 Player Stats'));
    console.log('==============');
    
    console.log(`\nName: ${chalk.cyan(player.name)}`);
    console.log(`Level: ${chalk.cyan(player.level)}`);
    console.log(`XP: ${chalk.cyan(player.xp)}`);
    
    if (player.badges.length > 0) {
      console.log(chalk.bold('\n🏆 Badges:'));
      player.badges.forEach(badge => {
        console.log(`  • ${badge.name}`);
        console.log(`    ${chalk.gray(badge.description)}`);
        console.log(`    ${chalk.gray(`Earned: ${new Date(badge.dateEarned).toLocaleDateString()}`)}`);
      });
    }
  }

  async showSettings(gameState: GameState) {
    console.clear();
    console.log(chalk.bold('\n⚙️ Settings'));
    console.log('==========');
    
    const { setting } = await inquirer.prompt({
      type: 'list',
      name: 'setting',
      message: 'What would you like to configure?',
      choices: [
        { name: '🎯 Update Financial Goals', value: 'goals' },
        { name: '⚠️ Risk Tolerance', value: 'risk' },
        { name: '🔔 Notifications', value: 'notifications' },
        { name: '↩️ Back to Main Menu', value: 'back' }
      ]
    });
    
    return setting;
  }

  async showError(message: string) {
    console.log(chalk.red(`\n❌ Error: ${message}`));
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async showSuccess(message: string) {
    console.log(chalk.green(`\n✅ Success: ${message}`));
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async confirmAction(message: string): Promise<boolean> {
    const { confirmed } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmed',
      message: message,
      default: false
    });
    return confirmed;
  }
} 