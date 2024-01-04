const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
const { Log } = require("ethers");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  //   const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks....");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      gasLimit: 4000000,
      args: [DECIMALS, INITIAL_ANSWER], //构造函数内的参数
      log: true,
    });
    log("Mocks deployed!");
    log("-------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
