import inquirer from 'inquirer'
import chalk from 'chalk'
import { PortfolioManager } from './agent.js'
import dotenv from 'dotenv'

dotenv.config()

// Очистка консоли и вывод заголовка
function clearAndShowHeader() {
  console.clear()
  console.log(chalk.blue.bold('🤖 DeFi Portfolio Manager'))
  console.log(chalk.cyan(`
👋 Привет! Я ваш DeFi портфельный менеджер.
Я помогу вам создать кошелек и управлять им.
  `))
}

// Обработка выхода
function handleExit() {
  console.log(chalk.yellow('\n👋 До свидания!'))
  process.exit(0)
}

async function main() {
  // Проверяем наличие API ключа
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(chalk.red('Error: ANTHROPIC_API_KEY not found in .env file'))
    process.exit(1)
  }
  
  const manager = new PortfolioManager(process.env.ANTHROPIC_API_KEY)
  
  // Очищаем консоль и показываем заголовок
  clearAndShowHeader()

  // Обработчики сигналов
  process.on('SIGINT', handleExit)
  process.on('SIGTERM', handleExit)

  // Основной цикл чата
  while(true) {
    try {
      const { message } = await inquirer.prompt({
        type: 'input',
        name: 'message',
        message: chalk.green('Вы:'),
        prefix: '💬'
      })
      
      // Проверяем выход
      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        handleExit()
      }
      
      await manager.processMessage(message)
    } catch (error) {
      if (error.isTtyError) {
        // Ошибка терминала, вероятно из-за перезапуска
        continue
      }
      console.error(chalk.red('❌ Ошибка:'), error.message)
    }
  }
}

// Запускаем приложение
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
}) 