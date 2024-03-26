import { ethers } from "ethers";
import dotenv from "dotenv";
import { OpenAI } from "openai";

const contractABI = require('./contracts/chat_completion_abi.json');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const system_msg = 'Do not include Assistant: or User: in your responses';

const USER_PROMPT_MAX_LEN = Number(process.env.USER_PROMPT_MAX_LEN);
const OPENAI_MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS);

const EXPECTED_PONG_BACK = 15000
const KEEP_ALIVE_CHECK_INTERVAL = 7500
const main = async () => {
  const wsProvider = new ethers.providers.WebSocketProvider(process.env.WS_URL as string);
  const signer = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY as string, wsProvider);
  const contractAddress = process.env.JOB_MANAGER_CONTRACT_ADDRESS as `0x${string}`;

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  let pingTimeout: any = null
  let keepAliveInterval: any = null

  wsProvider._websocket.on('open', () => {
    keepAliveInterval = setInterval(() => {
      console.log('Sending Ping')

      wsProvider._websocket.ping()

      pingTimeout = setTimeout(() => {
        wsProvider._websocket.terminate()
      }, EXPECTED_PONG_BACK)
    }, KEEP_ALIVE_CHECK_INTERVAL)

    contract.on("ChatCompletionRequested", async (requestId, requester, oracle, price, prompt, event) => {
      console.log(`New chat completion request: ${requestId}`);

      try {
        console.log('Prompt received:', prompt);
        const content = prompt.length > USER_PROMPT_MAX_LEN ? prompt.substring(prompt.length - USER_PROMPT_MAX_LEN) : prompt;
        console.log('Fetching Open AI response');
        const response = await openai.chat.completions.create({
          messages: [{ role: 'system', content: system_msg}, { role: 'user', content }],
          model: 'gpt-4',
          max_tokens: OPENAI_MAX_TOKENS
        });
        if(Array.isArray(response?.choices) && response.choices.length > 0) {
          console.log('Open AI Response:', response.choices[0].message.content)
          const fulfillTx = await contract.fulfill(
              requestId,
              response.choices[0].message.content
          );
          await fulfillTx.wait();
          console.log(`Request ${requestId} fulfilled.`);
        } else {
          console.log('Error getting Open AI response', response);
        }
      } catch(e) {
        console.log(e);
      }
    });
    console.log("Oracle is listening for ChatCompletionRequested events...");
  })

  wsProvider._websocket.on('close', () => {
    console.error('The websocket connection was closed')
    clearInterval(keepAliveInterval)
    clearTimeout(pingTimeout)
    main()
  })

  wsProvider._websocket.on('pong', () => {
    console.log('Received Pong')
    clearInterval(pingTimeout)
  })
};

main().catch((e) => {
  console.log(e);
})

