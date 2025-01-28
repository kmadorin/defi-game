import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
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
  let targetAddress = address
  if (!targetAddress) {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY)
    targetAddress = account.address
  }
  
  const balance = await publicClient.getBalance({ 
    address: targetAddress 
  })
  return balance
}

// Функция для подготовки транзакции
export async function prepareSendTransaction(walletClient, to, valueInEth) {
  try {
    const valueInWei = parseEther(valueInEth)
    return {
      to,
      value: valueInWei.toString(),
      from: walletClient.account.address
    }
  } catch (error) {
    throw new Error(`Ошибка подготовки транзакции: ${error.message}`)
  }
}

export async function sendTransaction(walletClient, to, value) {
  const hash = await walletClient.sendTransaction({
    to,
    value: BigInt(value)
  })
  return hash
}

// Функция для создания нового кошелька
export function generatePrivateKey() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
} 