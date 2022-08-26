import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import UniswapFactoryJSON from '@uniswap/v2-core/build/UniswapV2Factory.json';
import UniswapRouterJSON from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import UniswapWETHJSON from '@uniswap/v2-periphery/build/WETH9.json';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const gasLimit = (await hre.ethers.provider.getBlock(currentBlock)).gasLimit;

    const weth = await deploy("WETH", {
        from: deployer, args: [], contract: { bytecode: UniswapWETHJSON.bytecode, abi: UniswapWETHJSON.abi },
        log: true, waitConfirmations: 1, gasLimit: gasLimit
    });

    const factory = await deploy("UniswapV2Factory", {
        from: deployer, args: [ deployer ], contract: { bytecode: UniswapFactoryJSON.bytecode, abi: UniswapFactoryJSON.abi },
        log: true, waitConfirmations: 1, gasLimit: gasLimit
    });

    const router = await deploy("UniswapV2Router02", {
        from: deployer, args: [ factory.address, weth.address ],
        contract: { bytecode: UniswapRouterJSON.bytecode, abi: UniswapRouterJSON.abi },
        log: true, waitConfirmations: 1, gasLimit: gasLimit
    });

};
export default func;
func.tags = [ "FullDeploy" ];