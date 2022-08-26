### Specswap

Deploying Uniswap V2 contracts on Specular. `deploy` contains all necessary scripts for deploying UniswapV2 contracts, all imported directly from `@uniswap/v2-core` or `@uniswap/v2-periphery`.

`specswap` contains React code for simple swap front.

1. Populate a `.env` file following `.env-example`
2. Run `yarn hardhat deploy --network specular`
3. `swap` hardhat task is available for swapping `ERCA` with `ERCB`: `yarn hardhat swap --network specular --amount amountAforB`