const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { accounts } = require("web3/lib/commonjs/eth.exports");
// const { ethers } = require("ethers");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  //   const sendValue = "1000000000000000000"; //1 eth
  const sendValue = ethers.parseEther("1.0");
  beforeEach(async function () {
    //部署合约
    deployer = (await getNamedAccounts()).deployer;
    // deployer = await ethers.provider.getSigner();
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  //测试fundMe的构造方法
  describe("constructor", async function () {
    it("sets the aggregator address correctly", async function () {
      const responce = await fundMe.priceFeed();
      assert.equal(responce, mockV3Aggregator.target);
    });
  });
  //测试fundme的fund方法;
  describe("fund", async function () {
    it("Fails if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });
    it("updated the amount funded data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const responce = await fundMe.addressToAmountFunded(deployer);
      assert.equal(responce.toString(), sendValue.toString());
    });
    it("Adds funder to array of funder", async function () {
      await fundMe.fund({ value: sendValue });
      const responce = await fundMe.funders(0);
      assert.equal(responce, deployer);
    });
  });
  //测试withdraw函数
  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });
    //当只有一个账户进行提取金额时
    it("Withdraw ETH from a single founder ", async function () {
      const foundMeBalancece = await ethers.provider.getBalance(fundMe.target);
      console.log(`当前合约的余额为：${foundMeBalancece.toString()}`);
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      console.log(`调用合约的余额为：${startingDeployerBalance}`);

      const transactionResponce = await fundMe.withdraw();
      const transactionReceipt = await transactionResponce.wait(1);
      const { gasUsed, gasPrice } = transactionReceipt;
      const gasCost = gasUsed * gasPrice;
      console.log(`gasCost:${gasCost}`);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      );
      console.log(`取款后当前合约的余额为:${endingFundMeBalance.toString()}`);
      const endingDeployingBalance = await ethers.provider.getBalance(deployer);
      console.log(
        `取款后调用合约账户的余额为：${endingDeployingBalance.toString()}`
      );
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingDeployerBalance + foundMeBalancece,
        endingDeployingBalance + gasCost
      );
    });
    //当多个用户进行提取金额时
    it("withdraw ETH from many founders", async function () {
      const accounts = await ethers.getSigners();
      //建立6个账户连接
      for (let i = 0; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const foundMeBalancece = await ethers.provider.getBalance(fundMe.target);
      console.log(`当前合约的余额为：${foundMeBalancece.toString()}`);
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      console.log(`调用合约者的余额为：${startingDeployerBalance}`);
      const transactionResponce = await fundMe.withdraw();
      const transactionReceipt = await transactionResponce.wait(1);
      const { gasUsed, gasPrice } = transactionReceipt;
      const gasCost = gasUsed * gasPrice;
      const endingDeployingBalance = await ethers.provider.getBalance(deployer);
      console.log(
        `取款后调用合约账户的余额为：${endingDeployingBalance.toString()}`
      );
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingDeployerBalance + foundMeBalancece,
        endingDeployingBalance + gasCost
      );
      await expect(fundMe.funders(0)).to.be.reverted;

      for (let i = 0; i < 6; i++) {
        assert.equal(await fundMe.addressToAmountFunded(accounts[i].target), 0);
      }
    });
  });
});
