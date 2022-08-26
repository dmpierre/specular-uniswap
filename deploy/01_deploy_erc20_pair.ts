import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'ethers';
import ERC20PresetMinterPauserJSON from '@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json';

const MAX_UINT256 = ethers.constants.MaxInt256;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();

    //@ts-ignore (hardhat typings seems incorrect)
    const provider = hre.ethers.getDefaultProvider(hre.network.config.url);
    //@ts-ignore (hre.getSigner(deployer) defaults to a localhost provider..)
    const signer = new ethers.Wallet(hre.network.config.accounts[ 0 ], provider);

    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const gasLimit = (await hre.ethers.provider.getBlock(currentBlock)).gasLimit;
    const deployedFactory = await hre.ethers.getContract("UniswapV2Factory", deployer);
    const deployedRouter = await hre.ethers.getContract("UniswapV2Router02", deployer);
    const deployedWETH = await hre.ethers.getContract("WETH", deployer);

    // change value here.
    const depositWETH = await (await deployedWETH.deposit({ value: hre.ethers.utils.parseEther("1"), gasLimit: gasLimit })).wait(1);
    const approveWETH = await deployedWETH.approve(deployedRouter.address, MAX_UINT256, { gasLimit: gasLimit });
    console.log('Deposited WETH and approved router for WETH');

    const erc20A = await deploy("ERC20A", {
        contract: { bytecode: ERC20PresetMinterPauserJSON.bytecode, abi: ERC20PresetMinterPauserJSON.abi }, log: true,
        from: deployer, args: [ "AToken", "AA" ], waitConfirmations: 1, gasLimit: gasLimit
    });
    const deployedERC20A = (new hre.ethers.Contract(erc20A.address, ERC20PresetMinterPauserJSON.abi, provider)).connect(signer);
    const txMintA = await (await deployedERC20A.mint(deployer, hre.ethers.utils.parseEther("1000000"))).wait(1);
    console.log(`ERC20A deployed at ${erc20A.address}`);

    const erc20B = await deploy("ERC20B", {
        contract: { bytecode: ERC20PresetMinterPauserJSON.bytecode, abi: ERC20PresetMinterPauserJSON.abi }, log: true,
        from: deployer, args: [ "BToken", "BB" ], waitConfirmations: 1, gasLimit: gasLimit
    });
    const deployedERC20B = (new hre.ethers.Contract(erc20B.address, ERC20PresetMinterPauserJSON.abi, provider)).connect(signer);
    const txMintB = await (await deployedERC20B.mint(deployer, hre.ethers.utils.parseEther("1000000"))).wait(1);
    console.log(`ERC20B deployed at ${erc20B.address}`);

    const createdPair = await deployedFactory.createPair(erc20A.address, erc20B.address, { gasLimit: gasLimit });
    console.log(`Created pair`);

    const approveA = await deployedERC20A.approve(deployedRouter.address, MAX_UINT256, { gasLimit: gasLimit });
    console.log(`Approved for ERC20A`);

    const approveB = await deployedERC20B.approve(deployedRouter.address, MAX_UINT256, { gasLimit: gasLimit });
    console.log(`Approved for ERC20B`);

    const txAddLiquidityAWETH = await (await deployedRouter.addLiquidity(
        deployedERC20A.address,
        deployedWETH.address,
        hre.ethers.utils.parseUnits("100000", "ether"),
        hre.ethers.utils.parseUnits("5", "ether"),
        0,
        0,
        deployer,
        MAX_UINT256,
        {
            gasLimit: gasLimit
        }
    )).wait(1);
    console.log(`Liquidity added for ERC20A/WETH pool`);

    const txAddLiquidityBWETH = await (await deployedRouter.addLiquidity(
        deployedERC20B.address,
        deployedWETH.address,
        hre.ethers.utils.parseUnits("100000", "ether"),
        hre.ethers.utils.parseUnits("5", "ether"),
        0,
        0,
        deployer,
        MAX_UINT256,
        {
            gasLimit: gasLimit
        }
    )).wait(1);
    console.log(`Liquidity added for ERC20B/WETH pool`);

    const txAddLiquidityAB = await (await deployedRouter.addLiquidity(
        deployedERC20A.address,
        deployedERC20B.address,
        hre.ethers.utils.parseUnits("100000", "ether"),
        hre.ethers.utils.parseUnits("100000", "ether"),
        0,
        0,
        deployer,
        MAX_UINT256,
        {
            gasLimit: gasLimit
        }
    )).wait(1);
    console.log(`Liquidity added for ERC20A/ERC20B pool`);


};
export default func;
func.tags = [ "ERC20Pool" ];