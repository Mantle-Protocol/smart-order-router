"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSwapRouteFromExisting = exports.calculateGasUsed = exports.getL2ToL1GasUsed = exports.calculateOptimismToL1FeeFromCalldata = exports.calculateArbitrumToL1FeeFromCalldata = exports.getGasCostInQuoteToken = exports.getGasCostInNativeCurrency = exports.getGasCostInUSD = exports.getHighestLiquidityV3USDPool = exports.getHighestLiquidityV3NativePool = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const jsbi_1 = __importDefault(require("jsbi"));
const lodash_1 = __importDefault(require("lodash"));
const routers_1 = require("../routers");
const util_1 = require("../util");
const methodParameters_1 = require("./methodParameters");
// export async function getV2NativePool(
//   token: Token,
//   poolProvider: IV2PoolProvider,
//   providerConfig?: ProviderConfig
// ): Promise<Pair | null> {
//   const chainId = token.chainId as ChainId;
//   const weth = WRAPPED_NATIVE_CURRENCY[chainId]!;
//   const poolAccessor = await poolProvider.getPools(
//     [[weth, token]],
//     providerConfig
//   );
//   const pool = poolAccessor.getPool(weth, token);
//   if (!pool || pool.reserve0.equalTo(0) || pool.reserve1.equalTo(0)) {
//     log.error(
//       {
//         weth,
//         token,
//         reserve0: pool?.reserve0.toExact(),
//         reserve1: pool?.reserve1.toExact(),
//       },
//       `Could not find a valid WETH V2 pool with ${token.symbol} for computing gas costs.`
//     );
//     return null;
//   }
//   return pool;
// }
async function getHighestLiquidityV3NativePool(token, poolProvider, providerConfig) {
    const nativeCurrency = util_1.WRAPPED_NATIVE_CURRENCY[token.chainId];
    const nativePools = (0, lodash_1.default)([
        v3_sdk_1.FeeAmount.HIGH,
        v3_sdk_1.FeeAmount.MEDIUM,
        v3_sdk_1.FeeAmount.LOW,
        v3_sdk_1.FeeAmount.LOWEST,
    ])
        .map((feeAmount) => {
        return [nativeCurrency, token, feeAmount];
    })
        .value();
    const poolAccessor = await poolProvider.getPools(nativePools, providerConfig);
    const pools = (0, lodash_1.default)([
        v3_sdk_1.FeeAmount.HIGH,
        v3_sdk_1.FeeAmount.MEDIUM,
        v3_sdk_1.FeeAmount.LOW,
        v3_sdk_1.FeeAmount.LOWEST,
    ])
        .map((feeAmount) => {
        return poolAccessor.getPool(nativeCurrency, token, feeAmount);
    })
        .compact()
        .value();
    if (pools.length == 0) {
        util_1.log.error({ pools }, `Could not find a ${nativeCurrency.symbol} pool with ${token.symbol} for computing gas costs.`);
        return null;
    }
    const maxPool = pools.reduce((prev, current) => {
        return jsbi_1.default.greaterThan(prev.liquidity, current.liquidity) ? prev : current;
    });
    return maxPool;
}
exports.getHighestLiquidityV3NativePool = getHighestLiquidityV3NativePool;
async function getHighestLiquidityV3USDPool(chainId, poolProvider, providerConfig) {
    const usdTokens = routers_1.usdGasTokensByChain[chainId];
    const wrappedCurrency = util_1.WRAPPED_NATIVE_CURRENCY[chainId];
    if (!usdTokens) {
        throw new Error(`Could not find a USD token for computing gas costs on ${chainId}`);
    }
    const usdPools = (0, lodash_1.default)([
        v3_sdk_1.FeeAmount.HIGH,
        v3_sdk_1.FeeAmount.MEDIUM,
        v3_sdk_1.FeeAmount.LOW,
        v3_sdk_1.FeeAmount.LOWEST,
    ])
        .flatMap((feeAmount) => {
        return lodash_1.default.map(usdTokens, (usdToken) => [
            wrappedCurrency,
            usdToken,
            feeAmount,
        ]);
    })
        .value();
    const poolAccessor = await poolProvider.getPools(usdPools, providerConfig);
    const pools = (0, lodash_1.default)([
        v3_sdk_1.FeeAmount.HIGH,
        v3_sdk_1.FeeAmount.MEDIUM,
        v3_sdk_1.FeeAmount.LOW,
        v3_sdk_1.FeeAmount.LOWEST,
    ])
        .flatMap((feeAmount) => {
        const pools = [];
        for (const usdToken of usdTokens) {
            const pool = poolAccessor.getPool(wrappedCurrency, usdToken, feeAmount);
            if (pool) {
                pools.push(pool);
            }
        }
        return pools;
    })
        .compact()
        .value();
    if (pools.length == 0) {
        const message = `Could not find a USD/${wrappedCurrency.symbol} pool for computing gas costs.`;
        util_1.log.error({ pools }, message);
        throw new Error(message);
    }
    const maxPool = pools.reduce((prev, current) => {
        return jsbi_1.default.greaterThan(prev.liquidity, current.liquidity) ? prev : current;
    });
    return maxPool;
}
exports.getHighestLiquidityV3USDPool = getHighestLiquidityV3USDPool;
function getGasCostInUSD(usdPool, costNativeCurrency) {
    const nativeCurrency = costNativeCurrency.currency;
    // convert fee into usd
    const nativeTokenPrice = usdPool.token0.address == nativeCurrency.address
        ? usdPool.token0Price
        : usdPool.token1Price;
    const gasCostUSD = nativeTokenPrice.quote(costNativeCurrency);
    return gasCostUSD;
}
exports.getGasCostInUSD = getGasCostInUSD;
function getGasCostInNativeCurrency(nativeCurrency, gasCostInWei) {
    // wrap fee to native currency
    const costNativeCurrency = sdk_core_1.CurrencyAmount.fromRawAmount(nativeCurrency, gasCostInWei.toString());
    return costNativeCurrency;
}
exports.getGasCostInNativeCurrency = getGasCostInNativeCurrency;
async function getGasCostInQuoteToken(quoteToken, nativePool, costNativeCurrency) {
    const nativeTokenPrice = nativePool.token0.address == quoteToken.address
        ? nativePool.token1Price
        : nativePool.token0Price;
    const gasCostQuoteToken = nativeTokenPrice.quote(costNativeCurrency);
    return gasCostQuoteToken;
}
exports.getGasCostInQuoteToken = getGasCostInQuoteToken;
function calculateArbitrumToL1FeeFromCalldata(calldata, gasData) {
    const { perL2TxFee, perL1CalldataFee } = gasData;
    // calculates gas amounts based on bytes of calldata, use 0 as overhead.
    const l1GasUsed = getL2ToL1GasUsed(calldata, bignumber_1.BigNumber.from(0));
    // multiply by the fee per calldata and add the flat l2 fee
    let l1Fee = l1GasUsed.mul(perL1CalldataFee);
    l1Fee = l1Fee.add(perL2TxFee);
    return [l1GasUsed, l1Fee];
}
exports.calculateArbitrumToL1FeeFromCalldata = calculateArbitrumToL1FeeFromCalldata;
function calculateOptimismToL1FeeFromCalldata(calldata, gasData) {
    const { l1BaseFee, scalar, decimals, overhead } = gasData;
    const l1GasUsed = getL2ToL1GasUsed(calldata, overhead);
    // l1BaseFee is L1 Gas Price on etherscan
    const l1Fee = l1GasUsed.mul(l1BaseFee);
    const unscaled = l1Fee.mul(scalar);
    // scaled = unscaled / (10 ** decimals)
    const scaledConversion = bignumber_1.BigNumber.from(10).pow(decimals);
    const scaled = unscaled.div(scaledConversion);
    return [l1GasUsed, scaled];
}
exports.calculateOptimismToL1FeeFromCalldata = calculateOptimismToL1FeeFromCalldata;
// based on the code from the optimism OVM_GasPriceOracle contract
function getL2ToL1GasUsed(data, overhead) {
    // data is hex encoded
    const dataArr = data.slice(2).match(/.{1,2}/g);
    const numBytes = dataArr.length;
    let count = 0;
    for (let i = 0; i < numBytes; i += 1) {
        const byte = parseInt(dataArr[i], 16);
        if (byte == 0) {
            count += 4;
        }
        else {
            count += 16;
        }
    }
    const unsigned = overhead.add(count);
    const signedConversion = 68 * 16;
    return unsigned.add(signedConversion);
}
exports.getL2ToL1GasUsed = getL2ToL1GasUsed;
async function calculateGasUsed(chainId, route, simulatedGasUsed, 
//@ts-ignore
v2PoolProvider, v3PoolProvider, l2GasData, providerConfig) {
    const quoteToken = route.quote.currency.wrapped;
    const gasPriceWei = route.gasPriceWei;
    // calculate L2 to L1 security fee if relevant
    let l2toL1FeeInWei = bignumber_1.BigNumber.from(0);
    if ([sdk_core_1.ChainId.ARBITRUM_ONE, sdk_core_1.ChainId.ARBITRUM_GOERLI].includes(chainId)) {
        l2toL1FeeInWei = calculateArbitrumToL1FeeFromCalldata(route.methodParameters.calldata, l2GasData)[1];
    }
    else if ([
        sdk_core_1.ChainId.OPTIMISM,
        sdk_core_1.ChainId.OPTIMISM_GOERLI,
        sdk_core_1.ChainId.BASE,
        sdk_core_1.ChainId.BASE_GOERLI,
    ].includes(chainId)) {
        l2toL1FeeInWei = calculateOptimismToL1FeeFromCalldata(route.methodParameters.calldata, l2GasData)[1];
    }
    // add l2 to l1 fee and wrap fee to native currency
    const gasCostInWei = gasPriceWei.mul(simulatedGasUsed).add(l2toL1FeeInWei);
    const nativeCurrency = util_1.WRAPPED_NATIVE_CURRENCY[chainId];
    const costNativeCurrency = getGasCostInNativeCurrency(nativeCurrency, gasCostInWei);
    const usdPool = await getHighestLiquidityV3USDPool(chainId, v3PoolProvider, providerConfig);
    const gasCostUSD = await getGasCostInUSD(usdPool, costNativeCurrency);
    let gasCostQuoteToken = costNativeCurrency;
    // get fee in terms of quote token
    if (!quoteToken.equals(nativeCurrency)) {
        const nativePools = await Promise.all([
            getHighestLiquidityV3NativePool(quoteToken, v3PoolProvider, providerConfig),
            // getV2NativePool(quoteToken, v2PoolProvider, providerConfig),
        ]);
        const nativePool = nativePools.find((pool) => pool !== null);
        if (!nativePool) {
            util_1.log.info('Could not find any V2 or V3 pools to convert the cost into the quote token');
            gasCostQuoteToken = sdk_core_1.CurrencyAmount.fromRawAmount(quoteToken, 0);
        }
        else {
            gasCostQuoteToken = await getGasCostInQuoteToken(quoteToken, nativePool, costNativeCurrency);
        }
    }
    // Adjust quote for gas fees
    let quoteGasAdjusted;
    if (route.trade.tradeType == sdk_core_1.TradeType.EXACT_OUTPUT) {
        // Exact output - need more of tokenIn to get the desired amount of tokenOut
        quoteGasAdjusted = route.quote.add(gasCostQuoteToken);
    }
    else {
        // Exact input - can get less of tokenOut due to fees
        quoteGasAdjusted = route.quote.subtract(gasCostQuoteToken);
    }
    return {
        estimatedGasUsedUSD: gasCostUSD,
        estimatedGasUsedQuoteToken: gasCostQuoteToken,
        quoteGasAdjusted: quoteGasAdjusted,
    };
}
exports.calculateGasUsed = calculateGasUsed;
function initSwapRouteFromExisting(swapRoute, v2PoolProvider, v3PoolProvider, portionProvider, quoteGasAdjusted, estimatedGasUsed, estimatedGasUsedQuoteToken, estimatedGasUsedUSD, swapOptions) {
    const currencyIn = swapRoute.trade.inputAmount.currency;
    const currencyOut = swapRoute.trade.outputAmount.currency;
    const tradeType = swapRoute.trade.tradeType.valueOf()
        ? sdk_core_1.TradeType.EXACT_OUTPUT
        : sdk_core_1.TradeType.EXACT_INPUT;
    const routesWithValidQuote = swapRoute.route.map((route) => {
        switch (route.protocol) {
            case router_sdk_1.Protocol.V3:
                return new routers_1.V3RouteWithValidQuote({
                    amount: sdk_core_1.CurrencyAmount.fromFractionalAmount(route.amount.currency, route.amount.numerator, route.amount.denominator),
                    rawQuote: bignumber_1.BigNumber.from(route.rawQuote),
                    sqrtPriceX96AfterList: route.sqrtPriceX96AfterList.map((num) => bignumber_1.BigNumber.from(num)),
                    initializedTicksCrossedList: [...route.initializedTicksCrossedList],
                    quoterGasEstimate: bignumber_1.BigNumber.from(route.gasEstimate),
                    percent: route.percent,
                    route: route.route,
                    gasModel: route.gasModel,
                    quoteToken: new sdk_core_1.Token(currencyIn.chainId, route.quoteToken.address, route.quoteToken.decimals, route.quoteToken.symbol, route.quoteToken.name),
                    tradeType: tradeType,
                    v3PoolProvider: v3PoolProvider,
                });
            case router_sdk_1.Protocol.V2:
                return new routers_1.V2RouteWithValidQuote({
                    amount: sdk_core_1.CurrencyAmount.fromFractionalAmount(route.amount.currency, route.amount.numerator, route.amount.denominator),
                    rawQuote: bignumber_1.BigNumber.from(route.rawQuote),
                    percent: route.percent,
                    route: route.route,
                    gasModel: route.gasModel,
                    quoteToken: new sdk_core_1.Token(currencyIn.chainId, route.quoteToken.address, route.quoteToken.decimals, route.quoteToken.symbol, route.quoteToken.name),
                    tradeType: tradeType,
                    v2PoolProvider: v2PoolProvider,
                });
            case router_sdk_1.Protocol.MIXED:
                return new routers_1.MixedRouteWithValidQuote({
                    amount: sdk_core_1.CurrencyAmount.fromFractionalAmount(route.amount.currency, route.amount.numerator, route.amount.denominator),
                    rawQuote: bignumber_1.BigNumber.from(route.rawQuote),
                    sqrtPriceX96AfterList: route.sqrtPriceX96AfterList.map((num) => bignumber_1.BigNumber.from(num)),
                    initializedTicksCrossedList: [...route.initializedTicksCrossedList],
                    quoterGasEstimate: bignumber_1.BigNumber.from(route.gasEstimate),
                    percent: route.percent,
                    route: route.route,
                    mixedRouteGasModel: route.gasModel,
                    v2PoolProvider,
                    quoteToken: new sdk_core_1.Token(currencyIn.chainId, route.quoteToken.address, route.quoteToken.decimals, route.quoteToken.symbol, route.quoteToken.name),
                    tradeType: tradeType,
                    v3PoolProvider: v3PoolProvider,
                });
        }
    });
    const trade = (0, methodParameters_1.buildTrade)(currencyIn, currencyOut, tradeType, routesWithValidQuote);
    const quoteGasAndPortionAdjusted = swapRoute.portionAmount
        ? portionProvider.getQuoteGasAndPortionAdjusted(swapRoute.trade.tradeType, quoteGasAdjusted, swapRoute.portionAmount)
        : undefined;
    const routesWithValidQuotePortionAdjusted = portionProvider.getRouteWithQuotePortionAdjusted(swapRoute.trade.tradeType, routesWithValidQuote, swapOptions);
    return {
        quote: swapRoute.quote,
        quoteGasAdjusted,
        quoteGasAndPortionAdjusted,
        estimatedGasUsed,
        estimatedGasUsedQuoteToken,
        estimatedGasUsedUSD,
        gasPriceWei: bignumber_1.BigNumber.from(swapRoute.gasPriceWei),
        trade,
        route: routesWithValidQuotePortionAdjusted,
        blockNumber: bignumber_1.BigNumber.from(swapRoute.blockNumber),
        methodParameters: swapRoute.methodParameters
            ? {
                calldata: swapRoute.methodParameters.calldata,
                value: swapRoute.methodParameters.value,
                to: swapRoute.methodParameters.to,
            }
            : undefined,
        simulationStatus: swapRoute.simulationStatus,
        portionAmount: swapRoute.portionAmount,
    };
}
exports.initSwapRouteFromExisting = initSwapRouteFromExisting;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FzLWZhY3RvcnktaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL2dhcy1mYWN0b3J5LWhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQXFEO0FBQ3JELG9EQUErQztBQUMvQyxnREFNMkI7QUFFM0IsNENBQWtEO0FBQ2xELGdEQUF3QjtBQUN4QixvREFBdUI7QUFVdkIsd0NBUW9CO0FBQ3BCLGtDQUF1RDtBQUV2RCx5REFBZ0Q7QUFFaEQseUNBQXlDO0FBQ3pDLGtCQUFrQjtBQUNsQixtQ0FBbUM7QUFDbkMsb0NBQW9DO0FBQ3BDLDRCQUE0QjtBQUM1Qiw4Q0FBOEM7QUFDOUMsb0RBQW9EO0FBRXBELHNEQUFzRDtBQUN0RCx1QkFBdUI7QUFDdkIscUJBQXFCO0FBQ3JCLE9BQU87QUFDUCxvREFBb0Q7QUFFcEQseUVBQXlFO0FBQ3pFLGlCQUFpQjtBQUNqQixVQUFVO0FBQ1YsZ0JBQWdCO0FBQ2hCLGlCQUFpQjtBQUNqQiw4Q0FBOEM7QUFDOUMsOENBQThDO0FBQzlDLFdBQVc7QUFDWCw0RkFBNEY7QUFDNUYsU0FBUztBQUVULG1CQUFtQjtBQUNuQixNQUFNO0FBRU4saUJBQWlCO0FBQ2pCLElBQUk7QUFFRyxLQUFLLFVBQVUsK0JBQStCLENBQ25ELEtBQVksRUFDWixZQUE2QixFQUM3QixjQUErQjtJQUUvQixNQUFNLGNBQWMsR0FBRyw4QkFBdUIsQ0FBQyxLQUFLLENBQUMsT0FBa0IsQ0FBRSxDQUFDO0lBRTFFLE1BQU0sV0FBVyxHQUFHLElBQUEsZ0JBQUMsRUFBQztRQUNwQixrQkFBUyxDQUFDLElBQUk7UUFDZCxrQkFBUyxDQUFDLE1BQU07UUFDaEIsa0JBQVMsQ0FBQyxHQUFHO1FBQ2Isa0JBQVMsQ0FBQyxNQUFNO0tBQ2pCLENBQUM7U0FDQyxHQUFHLENBQTRCLENBQUMsU0FBUyxFQUFFLEVBQUU7UUFDNUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVB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