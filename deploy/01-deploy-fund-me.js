// function deployFunc() {
//   console.log("Hi!!");
// }

// module.exports.default = deployFunc;

const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //   const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  //在本地链和测试链进行转换
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  //   const chainId =
  // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
  const FundeMe = await deploy("FundMe", {
    from: deployer,
    gasLimit: 4000000,
    args: [ethUsdPriceFeedAddress], //构造函数内的参数
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(FundeMe.address, [ethUsdPriceFeedAddress]);
  }
  log("------------------");
};

module.exports.tags = ["all", "FundeMe"];
