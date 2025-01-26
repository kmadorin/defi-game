import chalk from 'chalk';
import inquirer from 'inquirer';
import { Quiz, LearningModule } from '../types/index.js';

export class LearningCenter {
  async showLearningMenu(modules: LearningModule[]) {
    console.clear();
    console.log(chalk.bold('\n📚 Learning Center'));
    console.log('===============');

    const { moduleIndex } = await inquirer.prompt({
      type: 'list',
      name: 'moduleIndex',
      message: 'Select a topic to learn:',
      choices: modules.map((module, index) => ({
        name: `📖 ${module.topic}`,
        value: index
      }))
    });

    await this.showModule(modules[moduleIndex]);
  }

  private async showModule(module: LearningModule) {
    console.clear();
    console.log(chalk.bold(`\n📖 ${module.topic}`));
    console.log('='.repeat(module.topic.length + 3));

    // Show content in chunks for better readability
    const chunks = module.content.split('\n');
    for (const chunk of chunks) {
      console.log(`\n${chunk}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Slight delay for readability
    }

    if (module.quiz && module.quiz.length > 0) {
      await this.runQuiz(module.quiz);
    }
  }

  private async runQuiz(quizzes: Quiz[]) {
    console.log(chalk.bold('\n🎯 Knowledge Check'));
    console.log('================');

    let correctAnswers = 0;

    for (const [index, quiz] of quizzes.entries()) {
      console.log(chalk.cyan(`\nQuestion ${index + 1}/${quizzes.length}:`));
      console.log(quiz.question);

      const { answer } = await inquirer.prompt({
        type: 'list',
        name: 'answer',
        message: 'Select your answer:',
        choices: quiz.choices.map((choice, i) => ({
          name: choice,
          value: i
        }))
      });

      if (answer === quiz.correct) {
        console.log(chalk.green('✅ Correct!'));
        correctAnswers++;
      } else {
        console.log(chalk.red('❌ Incorrect.'));
        console.log(chalk.yellow(`The correct answer was: ${quiz.choices[quiz.correct]}`));
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Show final score
    console.log(chalk.bold('\n📊 Quiz Results'));
    console.log('=============');
    const percentage = (correctAnswers / quizzes.length) * 100;
    console.log(`Score: ${chalk.cyan(`${correctAnswers}/${quizzes.length} (${percentage.toFixed(1)}%)`)}`);

    if (percentage >= 80) {
      console.log(chalk.green('🎉 Great job! You\'ve mastered this topic!'));
    } else if (percentage >= 60) {
      console.log(chalk.yellow('👍 Good effort! Review the material and try again to improve your score.'));
    } else {
      console.log(chalk.red('📚 Keep learning! Review the material and try again.'));
    }

    await inquirer.prompt({
      type: 'confirm',
      name: 'continue',
      message: 'Press enter to continue...',
      default: true
    });
  }

  async showProgress(completedModules: string[], totalModules: number) {
    const progress = (completedModules.length / totalModules) * 100;
    const progressBar = this.generateProgressBar(progress);
    
    console.log(chalk.bold('\n📈 Learning Progress'));
    console.log('=================');
    console.log(progressBar);
    console.log(`${progress.toFixed(1)}% Complete`);
    
    if (completedModules.length > 0) {
      console.log(chalk.bold('\n✅ Completed Modules:'));
      completedModules.forEach(module => {
        console.log(`  • ${module}`);
      });
    }
  }

  private generateProgressBar(percentage: number): string {
    const width = 30;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledBar = chalk.green('█'.repeat(filled));
    const emptyBar = chalk.gray('░'.repeat(empty));
    
    return `[${filledBar}${emptyBar}]`;
  }
} 