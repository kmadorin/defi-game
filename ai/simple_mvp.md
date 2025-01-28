# План разработки MVP консольного приложения

## 1. Настройка проекта
```bash
TODO: Создать базовую структуру проекта
npm init -y
npm install viem @anthropic-ai/sdk inquirer chalk dotenv
```

## 2. Базовая структура агента
```javascript:src/agent.js
import { Claude } from '@anthropic-ai/sdk'
import chalk from 'chalk'

// Базовые инструменты агента
const tools = {
  getBalance: async (address) => {
    // Implementation
  },
  sendTransaction: async (to, value) => {
    // Implementation
  },
  createWallet: async () => {
    // Implementation
  }
}

// Основной класс агента
class PortfolioManager {
  constructor(apiKey) {
    this.claude = new Claude({ apiKey })
    this.tools = tools
    this.memory = [] // Простое хранение контекста беседы
  }

  async processMessage(message) {
    // Формируем контекст для Claude
    const context = this.buildContext()
    
    // Получаем ответ от Claude
    const response = await this.claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      system: `You are a DeFi Portfolio Manager. You help users manage their crypto wallet and execute transactions.
Available tools: ${JSON.stringify(tools, null, 2)}
Current conversation context: ${context}`,
      messages: [{ role: 'user', content: message }]
    })

    // Обрабатываем tool calls если они есть
    if (response.tool_calls) {
      await this.executeTools(response.tool_calls)
    }

    return response.content
  }

  buildContext() {
    return this.memory.slice(-5).join('\n') // Последние 5 сообщений для контекста
  }

  async executeTools(toolCalls) {
    // Выполнение инструментов и обработка результатов
  }
}
```

## 3. Чат-интерфейс
```javascript:src/chat.js
import inquirer from 'inquirer'
import chalk from 'chalk'
import { PortfolioManager } from './agent.js'

async function main() {
  console.log(chalk.blue.bold('🤖 DeFi Portfolio Manager'))
  
  const manager = new PortfolioManager(process.env.ANTHROPIC_API_KEY)
  
  // Приветственное сообщение
  console.log(chalk.cyan(`
👋 Привет! Я ваш DeFi портфельный менеджер.
Я помогу вам создать кошелек и управлять им.
Хотите создать новый кошелек? (да/нет)
  `))

  while(true) {
    const { message } = await inquirer.prompt({
      type: 'input',
      name: 'message',
      message: chalk.green('Вы:')
    })
    
    try {
      const response = await manager.processMessage(message)
      console.log(chalk.blue('Менеджер:'), response)
    } catch (error) {
      console.error(chalk.red('Ошибка:'), error.message)
    }
  }
}
```

## 4. Интеграция с Ethereum
```javascript:src/blockchain.js
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

// Клиенты для работы с блокчейном
export function createClients(privateKey) {
  const account = privateKeyToAccount(privateKey)
  
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  })

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http()
  })

  return { publicClient, walletClient, account }
}

// Функции для работы с блокчейном
export async function getBalance(address, publicClient) {
  const balance = await publicClient.getBalance({ address })
  return balance
}

export async function sendTransaction(walletClient, to, value) {
  const hash = await walletClient.sendTransaction({
    to,
    value,
    gas: 21000n
  })
  return hash
}
```

## 5. Безопасность
```bash
TODO:
- Создать .env.example с примером необходимых переменных:
  ANTHROPIC_API_KEY=your_api_key_here
  PRIVATE_KEY=your_private_key_here (если есть)
- Добавить .env в .gitignore
- Добавить проверки и подтверждения для опасных операций
- Реализовать безопасное хранение приватного ключа
```

## 6. Тестирование
```bash
TODO: Проверить основные сценарии:
1. Создание и сохранение кошелька
2. Получение баланса
3. Отправка тестовой транзакции
4. Обработка ошибок и неизвестных команд
5. Сохранение контекста беседы
```

## 7. Запуск приложения
```json:package.json
{
  "type": "module",
  "scripts": {
    "start": "node src/chat.js"
  }
}
```

## Следующие шаги для разработчика:
1. Создать базовую структуру проекта и установить зависимости
2. Реализовать класс PortfolioManager с базовой обработкой сообщений
3. Настроить интеграцию с Claude API
4. Добавить инструменты для работы с кошельком
5. Реализовать чат-интерфейс с красивым форматированием
6. Протестировать основные сценарии
7. Добавить обработку ошибок и логирование
