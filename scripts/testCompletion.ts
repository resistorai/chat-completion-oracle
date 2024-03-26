import { ethers } from "ethers";
import dotenv from "dotenv";

const contractABI = require('../contracts/chat_completion_abi.json');

dotenv.config();

const test = async () => {
    const wsProvider = new ethers.providers.WebSocketProvider(process.env.WS_URL as string);
    const signer = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY as string, wsProvider);
    const contractAddress = process.env.JOB_MANAGER_CONTRACT_ADDRESS as `0x${string}`;

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const requestMessage = "How was your model trained?";

    console.log('Requesting the following prompt:', requestMessage)
    const requestCompletionTx = await contract.requestCompletion(
        requestMessage,
        {
            value: ethers.utils.parseEther("0.01") // Sending 0.01 TOR to cover the call price
        }
    );
    const receipt = await requestCompletionTx.wait();
    let requestId = '';
    for (const event of receipt.events) {
        if (event.event === "ChatCompletionRequested") {
            requestId = event.args[0];
            console.log(`Request sent, waiting for response. Request ID: ${requestId}`);
            break;
        }
    }
    contract.on("ChatCompletionFulfilled", async (receivedRequestId, response, event) => {
        if(receivedRequestId === requestId) {
            console.log(`Chat completion for request ${receivedRequestId} fulfilled:`, response);
            wsProvider._websocket.terminate();
        }
    });
};

test()

