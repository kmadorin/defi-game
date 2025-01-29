import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

// Blockchain clients
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

// Blockchain functions
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

// Function to prepare transaction
export async function prepareSendTransaction(walletClient, to, valueInEth) {
  try {
    const valueInWei = parseEther(valueInEth)
    const rawTx = await walletClient.prepareTransactionRequest({
      value: valueInWei,
      to 
    })

    return {
      rawTx,
      error: null,
      simulationResults: null
    }
  } catch (error) {
    return {
      rawTx: null,
      error: `Transaction preparation error: ${error.message}`,
      simulationResults: null
    }
  }
}

export async function sendTransaction(walletClient, rawTx) {
  try {
    // Convert string values back to BigInt where needed
    const tx = {
      ...rawTx,
      value: BigInt(rawTx.value),
      gas: rawTx.gas ? BigInt(rawTx.gas) : undefined,
      maxFeePerGas: rawTx.maxFeePerGas ? BigInt(rawTx.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: rawTx.maxPriorityFeePerGas ? BigInt(rawTx.maxPriorityFeePerGas) : undefined
    }
    
    const hash = await walletClient.sendTransaction(tx)
    return {
      hash,
      error: null
    }
  } catch (error) {
    return {
      hash: null,
      error: `Transaction sending error: ${error.message}`
    }
  }
}

// Function to create new wallet
export function generatePrivateKey() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
} 

export async function simulateTransactionWithAlchemy({ from, to, value, data }) {
  const hexValue = `0x${value.toString(16)}`
  
  const options = {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_simulateAssetChanges',
          params: [
              {
                  from,
                  to,
                  value: hexValue,
                  ...(data && { data })
              }
          ]
      })
  };

  try {
    const resultJSON = await fetch('https://eth-sepolia.g.alchemy.com/v2/vFCuc206bPWJtECIZ44QF6qrnsKLZXQa', options)
    const result = await resultJSON.json();
    return {
      result,
      error: null
    };
  } catch (error) {
    return {
      result: null,
      error: `Failed to simulate transaction: ${error.message}`
    };
  }
}

export async function sendRawTransaction(walletClient, serializedTransaction) {
  try {
    const hash = await walletClient.sendRawTransaction(serializedTransaction)
    return {
      hash,
      error: null
    }
  } catch (error) {
    console.log('error: ', error)
    return {
      hash: null, 
      error: `Failed to send raw transaction: ${error.message}`
    }
  }
}

export async function signTransaction(walletClient, tx) {
  try {
    const serializedTransaction = await walletClient.signTransaction(tx)
    return {
      serializedTransaction,
      error: null
    }
  } catch (error) {
    return {
      serializedTransaction: null,
      error: `Failed to sign transaction: ${error.message}`
    }
  }
}

export async function signAndSendRawTransaction(walletClient, rawTx) {
  try {
    // Convert string values back to BigInt where needed
    const tx = {
      to: rawTx.to,
      value: BigInt(rawTx.value),
      chainId: rawTx.chainId,
      type: rawTx.type,
      maxPriorityFeePerGas: rawTx.maxPriorityFeePerGas ? BigInt(rawTx.maxPriorityFeePerGas) : undefined,
      maxFeePerGas: rawTx.maxFeePerGas ? BigInt(rawTx.maxFeePerGas) : undefined,
      gas: rawTx.gas ? BigInt(rawTx.gas) : undefined,
      nonce: rawTx.nonce
    }

    const hash = await walletClient.sendTransaction(tx)
    return {
      hash,
      error: null
    }
  } catch (error) {
    return {
      hash: null,
      error: `Transaction error: ${error.message}`
    }
  }
}

