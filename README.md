### Specswap

Deploying Uniswap V2 contracts on Specular. `deploy` contains all necessary scripts for deploying UniswapV2 contracts, all imported directly from `@uniswap/v2-core` or `@uniswap/v2-periphery`.

You can obtain `WETH` using the `mintWETH` hardhat task. Ensure you have some ETH first. You can get some from [specular's faucet](http://faucet.l2specular.com/).

1. Populate a `.env` file following `.env-example`
2. Run `yarn hardhat deploy --network specular`
3. `swap` hardhat task is available for swapping `WETH`, `ERCA` or `ERCB` tokens.
