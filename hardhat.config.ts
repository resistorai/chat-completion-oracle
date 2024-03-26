import "dotenv/config";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-ethers";
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.25",
        settings: {
          evmVersion: 'paris',
          optimizer: {
            enabled: true,
            runs: 999999
          }
        }
      },
    ]
  },
  networks: {
    "resistor-testnet": {
      url: `${process.env.RPC_URL}`,
      chainId: 949888,
      accounts: [`${process.env.ORACLE_PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: {
      "resistor-testnet": 'N'
    },
    customChains: [
      {
        network: "resistor-testnet",
        chainId: 949888,
        urls: {
          apiURL: `${process.env.EXPLORER_API_URL}`,
          browserURL: `${process.env.EXPLORER_URL}`
        }
      }
    ]
  }
};
