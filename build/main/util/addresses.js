"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WETH9 = exports.constructSameAddressMap = exports.MULTICALL2_ADDRESS = exports.V3_MIGRATOR_ADDRESS = exports.NONFUNGIBLE_POSITION_MANAGER_ADDRESS = exports.TICK_LENS_ADDRESS = exports.ARB_GASINFO_ADDRESS = exports.OVM_GASPRICE_ADDRESS = exports.SWAP_ROUTER_02_ADDRESSES = exports.UNISWAP_MULTICALL_ADDRESSES = exports.MIXED_ROUTE_QUOTER_V1_ADDRESSES = exports.QUOTER_V2_ADDRESSES = exports.V3_CORE_FACTORY_ADDRESSES = exports.BNB_V3_MIGRATOR_ADDRESS = exports.BNB_SWAP_ROUTER_02_ADDRESS = exports.BNB_NONFUNGIBLE_POSITION_MANAGER_ADDRESS = exports.BNB_TICK_LENS_ADDRESS = void 0;
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const chains_1 = require("./chains");
exports.BNB_TICK_LENS_ADDRESS = sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BNB].tickLensAddress;
exports.BNB_NONFUNGIBLE_POSITION_MANAGER_ADDRESS = sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BNB].nonfungiblePositionManagerAddress;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
exports.BNB_SWAP_ROUTER_02_ADDRESS = sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BNB].swapRouter02Address;
exports.BNB_V3_MIGRATOR_ADDRESS = sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BNB].v3MigratorAddress;
exports.V3_CORE_FACTORY_ADDRESSES = Object.assign(Object.assign({}, constructSameAddressMap(v3_sdk_1.FACTORY_ADDRESS)), { [sdk_core_1.ChainId.CELO]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.CELO].v3CoreFactoryAddress, [sdk_core_1.ChainId.CELO_ALFAJORES]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.CELO_ALFAJORES].v3CoreFactoryAddress, [sdk_core_1.ChainId.OPTIMISM_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.OPTIMISM_GOERLI].v3CoreFactoryAddress, [sdk_core_1.ChainId.SEPOLIA]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.SEPOLIA].v3CoreFactoryAddress, [sdk_core_1.ChainId.ARBITRUM_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.ARBITRUM_GOERLI].v3CoreFactoryAddress, [sdk_core_1.ChainId.BNB]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BNB].v3CoreFactoryAddress, [sdk_core_1.ChainId.AVALANCHE]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.AVALANCHE].v3CoreFactoryAddress, [sdk_core_1.ChainId.BASE_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BASE_GOERLI].v3CoreFactoryAddress, [sdk_core_1.ChainId.BASE]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BASE].v3CoreFactoryAddress, [sdk_core_1.ChainId.MAGMA_TESTNET]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.MAGMA_TESTNET].v3CoreFactoryAddress });
exports.QUOTER_V2_ADDRESSES = Object.assign(Object.assign({}, constructSameAddressMap('0x61fFE014bA17989E743c5F6cB21bF9697530B21e')), { [sdk_core_1.ChainId.CELO]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.CELO].quoterAddress, [sdk_core_1.ChainId.CELO_ALFAJORES]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.CELO_ALFAJORES].quoterAddress, [sdk_core_1.ChainId.OPTIMISM_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.OPTIMISM_GOERLI].quoterAddress, [sdk_core_1.ChainId.SEPOLIA]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.SEPOLIA].quoterAddress, [sdk_core_1.ChainId.ARBITRUM_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.ARBITRUM_GOERLI].quoterAddress, [sdk_core_1.ChainId.BNB]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BNB].quoterAddress, [sdk_core_1.ChainId.AVALANCHE]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.AVALANCHE].quoterAddress, [sdk_core_1.ChainId.BASE_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BASE_GOERLI].quoterAddress, [sdk_core_1.ChainId.BASE]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BASE].quoterAddress, 
    // TODO: Gnosis + Moonbeam contracts to be deployed
    [sdk_core_1.ChainId.MAGMA_TESTNET]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.MAGMA_TESTNET].quoterAddress });
exports.MIXED_ROUTE_QUOTER_V1_ADDRESSES = {
    [sdk_core_1.ChainId.MAINNET]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.MAINNET].v1MixedRouteQuoterAddress,
    [sdk_core_1.ChainId.GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.GOERLI].v1MixedRouteQuoterAddress,
};
exports.UNISWAP_MULTICALL_ADDRESSES = Object.assign(Object.assign({}, constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984')), { [sdk_core_1.ChainId.CELO]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.CELO].multicallAddress, [sdk_core_1.ChainId.CELO_ALFAJORES]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.CELO_ALFAJORES].multicallAddress, [sdk_core_1.ChainId.OPTIMISM_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.OPTIMISM_GOERLI].multicallAddress, [sdk_core_1.ChainId.SEPOLIA]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.SEPOLIA].multicallAddress, [sdk_core_1.ChainId.ARBITRUM_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.ARBITRUM_GOERLI].multicallAddress, [sdk_core_1.ChainId.BNB]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BNB].multicallAddress, [sdk_core_1.ChainId.AVALANCHE]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.AVALANCHE].multicallAddress, [sdk_core_1.ChainId.BASE_GOERLI]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BASE_GOERLI].multicallAddress, [sdk_core_1.ChainId.BASE]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.BASE].multicallAddress, 
    // TODO: Gnosis + Moonbeam contracts to be deployed
    [sdk_core_1.ChainId.MAGMA_TESTNET]: sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.MAGMA_TESTNET].multicallAddress });
const SWAP_ROUTER_02_ADDRESSES = (chainId) => {
    if (chainId == sdk_core_1.ChainId.BNB) {
        return exports.BNB_SWAP_ROUTER_02_ADDRESS;
    }
    return '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
};
exports.SWAP_ROUTER_02_ADDRESSES = SWAP_ROUTER_02_ADDRESSES;
exports.OVM_GASPRICE_ADDRESS = '0x420000000000000000000000000000000000000F';
exports.ARB_GASINFO_ADDRESS = '0x000000000000000000000000000000000000006C';
exports.TICK_LENS_ADDRESS = sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.ARBITRUM_ONE].tickLensAddress;
exports.NONFUNGIBLE_POSITION_MANAGER_ADDRESS = sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.MAINNET].nonfungiblePositionManagerAddress;
exports.V3_MIGRATOR_ADDRESS = sdk_core_1.CHAIN_TO_ADDRESSES_MAP[sdk_core_1.ChainId.MAINNET].v3MigratorAddress;
exports.MULTICALL2_ADDRESS = '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696';
function constructSameAddressMap(address, additionalNetworks = []) {
    return chains_1.NETWORKS_WITH_SAME_UNISWAP_ADDRESSES.concat(additionalNetworks).reduce((memo, chainId) => {
        memo[chainId] = address;
        return memo;
    }, {});
}
exports.constructSameAddressMap = constructSameAddressMap;
exports.WETH9 = {
    [sdk_core_1.ChainId.MAINNET]: new sdk_core_1.Token(sdk_core_1.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.GOERLI]: new sdk_core_1.Token(sdk_core_1.ChainId.GOERLI, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.SEPOLIA]: new sdk_core_1.Token(sdk_core_1.ChainId.SEPOLIA, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.OPTIMISM]: new sdk_core_1.Token(sdk_core_1.ChainId.OPTIMISM, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.OPTIMISM_GOERLI]: new sdk_core_1.Token(sdk_core_1.ChainId.OPTIMISM_GOERLI, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.ARBITRUM_ONE]: new sdk_core_1.Token(sdk_core_1.ChainId.ARBITRUM_ONE, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.ARBITRUM_GOERLI]: new sdk_core_1.Token(sdk_core_1.ChainId.ARBITRUM_GOERLI, '0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.BASE_GOERLI]: new sdk_core_1.Token(sdk_core_1.ChainId.BASE_GOERLI, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.BASE]: new sdk_core_1.Token(sdk_core_1.ChainId.BASE, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.OPTIMISM_SEPOLIA]: new sdk_core_1.Token(sdk_core_1.ChainId.OPTIMISM_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.ARBITRUM_SEPOLIA]: new sdk_core_1.Token(sdk_core_1.ChainId.ARBITRUM_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [sdk_core_1.ChainId.MAGMA_TESTNET]: new sdk_core_1.Token(sdk_core_1.ChainId.MAGMA_TESTNET, '0xa653eef72d5141e4c3c6c8b66f66e6a42af85958', 18, 'WLAVA', 'Wrapped LAVA'),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkcmVzc2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvYWRkcmVzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdEQUEyRTtBQUMzRSw0Q0FBa0Q7QUFFbEQscUNBQWdFO0FBRW5ELFFBQUEscUJBQXFCLEdBQ2hDLGlDQUFzQixDQUFDLGtCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDO0FBQ3pDLFFBQUEsd0NBQXdDLEdBQ25ELGlDQUFzQixDQUFDLGtCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsaUNBQWlDLENBQUM7QUFDeEUsb0VBQW9FO0FBQ3ZELFFBQUEsMEJBQTBCLEdBQ3JDLGlDQUFzQixDQUFDLGtCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsbUJBQW9CLENBQUM7QUFDOUMsUUFBQSx1QkFBdUIsR0FDbEMsaUNBQXNCLENBQUMsa0JBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztBQUUzQyxRQUFBLHlCQUF5QixtQ0FDakMsdUJBQXVCLENBQUMsd0JBQWUsQ0FBQyxLQUMzQyxDQUFDLGtCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsaUNBQXNCLENBQUMsa0JBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsRUFDekUsQ0FBQyxrQkFBTyxDQUFDLGNBQWMsQ0FBQyxFQUN0QixpQ0FBc0IsQ0FBQyxrQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLG9CQUFvQixFQUNyRSxDQUFDLGtCQUFPLENBQUMsZUFBZSxDQUFDLEVBQ3ZCLGlDQUFzQixDQUFDLGtCQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsb0JBQW9CLEVBQ3RFLENBQUMsa0JBQU8sQ0FBQyxPQUFPLENBQUMsRUFDZixpQ0FBc0IsQ0FBQyxrQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLG9CQUFvQixFQUM5RCxDQUFDLGtCQUFPLENBQUMsZUFBZSxDQUFDLEVBQ3ZCLGlDQUFzQixDQUFDLGtCQUFP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