import dotenv from "dotenv"
import { createClients, signTransaction } from "./blockchain.js"
import { prepareSendTransaction, simulateTransactionWithAlchemy, sendRawTransaction } from "./blockchain.js"

dotenv.config()

async function run() {
    const { walletClient } = createClients(process.env.PRIVATE_KEY)
    const {rawTx, error: prepareSendTransactionError} = await prepareSendTransaction(walletClient, "0x1042D4fc2AA57993DAD3DF83405E2cCeD75437bC", '0.001')

    if (prepareSendTransactionError) {
        console.log('prepareSendTransactionError: ', prepareSendTransactionError)
        return prepareSendTransactionError;
    }

    const {result: simulationResults, error: simulationError} = await simulateTransactionWithAlchemy(rawTx);

    if (simulationError) {
        console.log('simulationError: ', simulationError)
        return simulationError;
    }

    const serializedTransaction = await signTransaction(walletClient, rawTx)

    const {hash, error: sendError} = await sendRawTransaction(walletClient, serializedTransaction);

    if (sendError) {
        console.log('sendError: ', sendError)
        return sendError
    }

    console.log('hash: ', hash)
}

run();