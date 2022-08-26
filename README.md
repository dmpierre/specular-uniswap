### Specswap

Deploying Uniswap V2 contracts on Specular. `deploy` contains all necessary scripts for deploying UniswapV2 contracts, all imported directly from `@uniswap/v2-core` or `@uniswap/v2-periphery`.

1. Populate a `.env` file following `.env-example`
2. Run `yarn hardhat deploy --network specular`
3. `swap` hardhat task is available for swapping `WETH`, `ERCA` or `ERCB` tokens.