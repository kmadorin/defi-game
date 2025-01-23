import { DailyReport } from '../types';
import chalk from 'chalk';

export function showDailyReport(report: DailyReport) {
  console.log('\n📊 Daily Report');
  console.log('==============');
  
  // Show earnings
  console.log(`💰 Earnings: ${chalk.green(`$${report.earnings.toFixed(2)}`)}`);
  
  // Show risks
  if (report.risksDetected.length > 0) {
    console.log('\n⚠️  Risks Detected:');
    report.risksDetected.forEach(risk => {
      console.log(chalk.yellow(`  • ${risk}`));
    });
  }
  
  // Show portfolio snapshot
  console.log('\n📈 Portfolio:');
  console.log(`  Total Value: $${report.portfolioSnapshot.totalValue.toFixed(2)}`);
  console.log(`  Day Change: ${chalk.green(`${report.portfolioSnapshot.dayChange > 0 ? '+' : ''}${report.portfolioSnapshot.dayChange.toFixed(2)}%`)}`);
} 