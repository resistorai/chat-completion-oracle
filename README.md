# Resistor AI Chat Completion Oracle

https://resistorai.org

This project connects to the Resistor AI custom EVM blockchain, listens for chat completion requests, uses OpenAI's ChatGPT to generate responses, and then submits those responses back to the blockchain.

## Prerequisites

- Node.js (v18 or higher) https://nodejs.org/en/download
- npm (comes with Node.js)
- An OpenAI API key
- A Resistor AI wallet with some TOR to deploy the Oracle contract.
- A ChatCompletion contract with the address above set as Oracle

## Setup

Make sure you have installed Node.js, npm and gathered all the items above.

Now, clone the repository and install the dependencies:

```
git clone https://github.com/resistorai/chat-completion-oracle.git
cd chat-completion-oracle
npm install
```

## On-Chain Configuration

### To become a chat completion oracle, you need to:
1. Deploy the ChatCompletion contract (located in chat-completion-oracle/contracts/ChatCompletion.sol)
2. Request an OpenAI API key (https://platform.openai.com/)
3. Configure and run this Oracle Node code.

## Deploying the Oracle Smart contract with Hardhat (Easy)

Run the following command
```
npx hardhat run scripts/deploy.ts --network resistor-testnet
```

This will deploy and verify your contract.
Save the contract address displayed on your terminal and go to the Oracle Configuration section

### Deploying the Oracle Smart contract without Hardhat (Harder)

1. Configure your wallet (Metamask or similar) with Resistor AI Testnet configuration:
```
Network Name: Resistor AI Testnet
RPC Url: https://rpc-testnet.resistorai.org
Chain ID: 949888
Currency symbol: TOR
Block explorer URL: https://scan-testnet.resistorai.org
```

2. Go to your favorite tool to deploy smart contracts such as https://remix.ethereum.org/

3. Make sure you're on Resistor AI

4. Deploy the contract located in chat-completion-oracle/contracts/ChatCompletion.sol

5. Verify it on https://scan-testnet.resistorai.org

## Oracle Configuration

Copy .env.example to .env and change the settings below:

```
#Chat Completion Oracle Contract Address - Example at 0x7fF30df942995aAFfD8FF968e9E500cEf7CC3c59
#Enter the contract address you deployed in the section above

JOB_MANAGER_CONTRACT_ADDRESS=the_contract_address_you_deployed_above

#Oracle Node Private Key - The authorized oracle to receive and fulfill requests on the contract above
#Enter the private key of the wallet you used to deploy the contract

ORACLE_PRIVATE_KEY=your_oracle_private_key

#OpenAI API Key to fetch Chat GPT responses

OPENAI_API_KEY=your_openai_api_key_here
```

## Running your Oracle

Run the following command on your terminal, and you will start mining Chat Completion requests on Resistor

```
ts-node index.ts
```

## Testing

To test your oracle, a Chat Completion request must be made on your smart contract.
You can either interact with the requestCompletion method directly on https://scan-testnet.resistorai.org
or while running your Oracle, open a new terminal and run:

```
ts-node scripts/testCompletion.ts
```