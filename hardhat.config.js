require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("hardhat-abi-exporter");


const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim();
const maticVigilKey = fs.readFileSync(".matic-vigil-key").toString().trim();

module.exports = {
  // defaultNetwork: "matic",
  networks: {
    hardhat: {
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey],
      gas: 5500000,
      gasPrice: 7000000000
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com/v1/" + maticVigilKey,
      accounts: [privateKey],
      gasPrice: 50000000000
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/-nw7FtkMK75fzL9eVQpzsfwnoRYlAujV",
      accounts: [privateKey]
    }
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  },
  gasReporter: {
    enabled: true
  },
  abiExporter: {
    path: './data/abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
    pretty: false,
  }
}