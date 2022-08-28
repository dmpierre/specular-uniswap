import 'dotenv/config';
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy';
import { HardhatUserConfig } from "hardhat/types";
import "hardhat-abi-exporter";
import { task } from 'hardhat/config';
import "hardhat-deploy";
import { ethers } from "ethers";
import "@uniswap/hardhat-v3-deploy";
import assert from 'assert';

const deployerWallet = process.env[ "PK" ] ? new ethers.Wallet(process.env[ "PK" ]) : ethers.Wallet.createRandom();

task("mintWETH", "Mint WETH to your address. Ensure you have ETH first. You can get some from specular faucet")
  .addParam("amount", "in ETH")
  .setAction(async ({ amount }, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    const deployedWETH = await hre.ethers.getContract("WETH");
    const txDeposit = await deployedWETH.deposit({
      value: hre.ethers.utils.parseEther(`${amount}`)
    });
    console.log(txDeposit);
  });

task("swap", "Swap ERC20A for ERC20B")
  .addParam("token1")
  .addParam("token2")
  .addParam("amount", "in ETH")
  .setAction(async ({ amount, token1, token2 }, hre) => {
    const acceptedTokens = [ "WETH", "ERC20A", "ERC20B" ];

    assert(acceptedTokens.includes(token1));
    assert(acceptedTokens.includes(token2));
    assert(token1 != token2);

    const { deployer } = await hre.getNamedAccounts();
    const deployedRouter = await hre.ethers.getContract("UniswapV2Router02", deployer);
    const addressToken1 = (await hre.ethers.getContract(token1)).address;
    const addressToken2 = (await hre.ethers.getContract(token2)).address;
    const weiAmountIn = hre.ethers.utils.parseEther(amount);
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const gasLimit = (await hre.ethers.provider.getBlock(currentBlock)).gasLimit;
    const swap = await deployedRouter.swapExactTokensForTokens(
      weiAmountIn,
      0,
      [ addressToken1, addressToken2 ],
      deployer,
      hre.ethers.constants.MaxUint256,
      { gasLimit: gasLimit }
    );
    const receit = await swap.wait(1);
    console.log(receit);
  });

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: {
      "specular": `privatekey://${deployerWallet.privateKey}`,
      "hardhat": 0,
      "localhost": 0
    }
  },
  networks: {
    specular: {
      url: process.env[ "SPECULAR_RPC_ENDPOINT" ],
      chainId: Number(process.env[ "SPECULAR_CHAIN_ID" ]),
      accounts: [ `${deployerWallet.privateKey}` ]
    }
  },
};

export default config;