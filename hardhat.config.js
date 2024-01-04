require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-ethers");
require("solidity-coverage");
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const COINMARKEYCAP_API_KEY = process.env.COINMARKEYCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  // solidity: "0.8.8",
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      { version: "0.6.6" },
    ],
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 1,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: true, //开启gasfee 明细
    outputFile: "gas-report.text", //将其打印输出在一个文件中
    noColors: true,
    currency: "USD", //设置单位
    coinmarketcap: COINMARKEYCAP_API_KEY,
    token: "MATIC",
  },
  etherscan: {
    apiKey: process.env.API_KEY,
  },
};
