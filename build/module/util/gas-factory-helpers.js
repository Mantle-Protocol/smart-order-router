import { BigNumber } from '@ethersproject/bignumber';
import { Protocol } from '@uniswap/router-sdk';
import { ChainId, CurrencyAmount, Token, TradeType, } from '@uniswap/sdk-core';
import { FeeAmount } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import _ from 'lodash';
import { MixedRouteWithValidQuote, usdGasTokensByChain, V2RouteWithValidQuote, V3RouteWithValidQuote, } from '../routers';
import { log, WRAPPED_NATIVE_CURRENCY } from '../util';
import { buildTrade } from './methodParameters';
export async function getV2NativePool(token, poolProvider, providerConfig) {
    const chainId = token.chainId;
    const weth = WRAPPED_NATIVE_CURRENCY[chainId];
    const poolAccessor = await poolProvider.getPools([[weth, token]], providerConfig);
    const pool = poolAccessor.getPool(weth, token);
    if (!pool || pool.reserve0.equalTo(0) || pool.reserve1.equalTo(0)) {
        log.error({
            weth,
            token,
            reserve0: pool === null || pool === void 0 ? void 0 : pool.reserve0.toExact(),
            reserve1: pool === null || pool === void 0 ? void 0 : pool.reserve1.toExact(),
        }, `Could not find a valid WETH V2 pool with ${token.symbol} for computing gas costs.`);
        return null;
    }
    return pool;
}
export async function getHighestLiquidityV3NativePool(token, poolProvider, providerConfig) {
    const nativeCurrency = WRAPPED_NATIVE_CURRENCY[token.chainId];
    const nativePools = _([
        FeeAmount.HIGH,
        FeeAmount.MEDIUM,
        FeeAmount.LOW,
        FeeAmount.LOWEST,
    ])
        .map((feeAmount) => {
        return [nativeCurrency, token, feeAmount];
    })
        .value();
    const poolAccessor = await poolProvider.getPools(nativePools, providerConfig);
    const pools = _([
        FeeAmount.HIGH,
        FeeAmount.MEDIUM,
        FeeAmount.LOW,
        FeeAmount.LOWEST,
    ])
        .map((feeAmount) => {
        return poolAccessor.getPool(nativeCurrency, token, feeAmount);
    })
        .compact()
        .value();
    if (pools.length == 0) {
        log.error({ pools }, `Could not find a ${nativeCurrency.symbol} pool with ${token.symbol} for computing gas costs.`);
        return null;
    }
    const maxPool = pools.reduce((prev, current) => {
        return JSBI.greaterThan(prev.liquidity, current.liquidity) ? prev : current;
    });
    return maxPool;
}
export async function getHighestLiquidityV3USDPool(chainId, poolProvider, providerConfig) {
    const usdTokens = usdGasTokensByChain[chainId];
    const wrappedCurrency = WRAPPED_NATIVE_CURRENCY[chainId];
    if (!usdTokens) {
        throw new Error(`Could not find a USD token for computing gas costs on ${chainId}`);
    }
    const usdPools = _([
        FeeAmount.HIGH,
        FeeAmount.MEDIUM,
        FeeAmount.LOW,
        FeeAmount.LOWEST,
    ])
        .flatMap((feeAmount) => {
        return _.map(usdTokens, (usdToken) => [
            wrappedCurrency,
            usdToken,
            feeAmount,
        ]);
    })
        .value();
    const poolAccessor = await poolProvider.getPools(usdPools, providerConfig);
    const pools = _([
        FeeAmount.HIGH,
        FeeAmount.MEDIUM,
        FeeAmount.LOW,
        FeeAmount.LOWEST,
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
        log.error({ pools }, message);
        throw new Error(message);
    }
    const maxPool = pools.reduce((prev, current) => {
        return JSBI.greaterThan(prev.liquidity, current.liquidity) ? prev : current;
    });
    return maxPool;
}
export function getGasCostInUSD(usdPool, costNativeCurrency) {
    const nativeCurrency = costNativeCurrency.currency;
    // convert fee into usd
    const nativeTokenPrice = usdPool.token0.address == nativeCurrency.address
        ? usdPool.token0Price
        : usdPool.token1Price;
    const gasCostUSD = nativeTokenPrice.quote(costNativeCurrency);
    return gasCostUSD;
}
export function getGasCostInNativeCurrency(nativeCurrency, gasCostInWei) {
    // wrap fee to native currency
    const costNativeCurrency = CurrencyAmount.fromRawAmount(nativeCurrency, gasCostInWei.toString());
    return costNativeCurrency;
}
export async function getGasCostInQuoteToken(quoteToken, nativePool, costNativeCurrency) {
    const nativeTokenPrice = nativePool.token0.address == quoteToken.address
        ? nativePool.token1Price
        : nativePool.token0Price;
    const gasCostQuoteToken = nativeTokenPrice.quote(costNativeCurrency);
    return gasCostQuoteToken;
}
export function calculateArbitrumToL1FeeFromCalldata(calldata, gasData) {
    const { perL2TxFee, perL1CalldataFee } = gasData;
    // calculates gas amounts based on bytes of calldata, use 0 as overhead.
    const l1GasUsed = getL2ToL1GasUsed(calldata, BigNumber.from(0));
    // multiply by the fee per calldata and add the flat l2 fee
    let l1Fee = l1GasUsed.mul(perL1CalldataFee);
    l1Fee = l1Fee.add(perL2TxFee);
    return [l1GasUsed, l1Fee];
}
export function calculateOptimismToL1FeeFromCalldata(calldata, gasData) {
    const { l1BaseFee, scalar, decimals, overhead } = gasData;
    const l1GasUsed = getL2ToL1GasUsed(calldata, overhead);
    // l1BaseFee is L1 Gas Price on etherscan
    const l1Fee = l1GasUsed.mul(l1BaseFee);
    const unscaled = l1Fee.mul(scalar);
    // scaled = unscaled / (10 ** decimals)
    const scaledConversion = BigNumber.from(10).pow(decimals);
    const scaled = unscaled.div(scaledConversion);
    return [l1GasUsed, scaled];
}
// based on the code from the optimism OVM_GasPriceOracle contract
export function getL2ToL1GasUsed(data, overhead) {
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
export async function calculateGasUsed(chainId, route, simulatedGasUsed, v2PoolProvider, v3PoolProvider, l2GasData, providerConfig) {
    const quoteToken = route.quote.currency.wrapped;
    const gasPriceWei = route.gasPriceWei;
    // calculate L2 to L1 security fee if relevant
    let l2toL1FeeInWei = BigNumber.from(0);
    if ([ChainId.ARBITRUM_ONE, ChainId.ARBITRUM_GOERLI].includes(chainId)) {
        l2toL1FeeInWei = calculateArbitrumToL1FeeFromCalldata(route.methodParameters.calldata, l2GasData)[1];
    }
    else if ([
        ChainId.OPTIMISM,
        ChainId.OPTIMISM_GOERLI,
        ChainId.BASE,
        ChainId.BASE_GOERLI,
    ].includes(chainId)) {
        l2toL1FeeInWei = calculateOptimismToL1FeeFromCalldata(route.methodParameters.calldata, l2GasData)[1];
    }
    // add l2 to l1 fee and wrap fee to native currency
    const gasCostInWei = gasPriceWei.mul(simulatedGasUsed).add(l2toL1FeeInWei);
    const nativeCurrency = WRAPPED_NATIVE_CURRENCY[chainId];
    const costNativeCurrency = getGasCostInNativeCurrency(nativeCurrency, gasCostInWei);
    const usdPool = await getHighestLiquidityV3USDPool(chainId, v3PoolProvider, providerConfig);
    const gasCostUSD = await getGasCostInUSD(usdPool, costNativeCurrency);
    let gasCostQuoteToken = costNativeCurrency;
    // get fee in terms of quote token
    if (!quoteToken.equals(nativeCurrency)) {
        const nativePools = await Promise.all([
            getHighestLiquidityV3NativePool(quoteToken, v3PoolProvider, providerConfig),
            getV2NativePool(quoteToken, v2PoolProvider, providerConfig),
        ]);
        const nativePool = nativePools.find((pool) => pool !== null);
        if (!nativePool) {
            log.info('Could not find any V2 or V3 pools to convert the cost into the quote token');
            gasCostQuoteToken = CurrencyAmount.fromRawAmount(quoteToken, 0);
        }
        else {
            gasCostQuoteToken = await getGasCostInQuoteToken(quoteToken, nativePool, costNativeCurrency);
        }
    }
    // Adjust quote for gas fees
    let quoteGasAdjusted;
    if (route.trade.tradeType == TradeType.EXACT_OUTPUT) {
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
export function initSwapRouteFromExisting(swapRoute, v2PoolProvider, v3PoolProvider, portionProvider, quoteGasAdjusted, estimatedGasUsed, estimatedGasUsedQuoteToken, estimatedGasUsedUSD, swapOptions) {
    const currencyIn = swapRoute.trade.inputAmount.currency;
    const currencyOut = swapRoute.trade.outputAmount.currency;
    const tradeType = swapRoute.trade.tradeType.valueOf()
        ? TradeType.EXACT_OUTPUT
        : TradeType.EXACT_INPUT;
    const routesWithValidQuote = swapRoute.route.map((route) => {
        switch (route.protocol) {
            case Protocol.V3:
                return new V3RouteWithValidQuote({
                    amount: CurrencyAmount.fromFractionalAmount(route.amount.currency, route.amount.numerator, route.amount.denominator),
                    rawQuote: BigNumber.from(route.rawQuote),
                    sqrtPriceX96AfterList: route.sqrtPriceX96AfterList.map((num) => BigNumber.from(num)),
                    initializedTicksCrossedList: [...route.initializedTicksCrossedList],
                    quoterGasEstimate: BigNumber.from(route.gasEstimate),
                    percent: route.percent,
                    route: route.route,
                    gasModel: route.gasModel,
                    quoteToken: new Token(currencyIn.chainId, route.quoteToken.address, route.quoteToken.decimals, route.quoteToken.symbol, route.quoteToken.name),
                    tradeType: tradeType,
                    v3PoolProvider: v3PoolProvider,
                });
            case Protocol.V2:
                return new V2RouteWithValidQuote({
                    amount: CurrencyAmount.fromFractionalAmount(route.amount.currency, route.amount.numerator, route.amount.denominator),
                    rawQuote: BigNumber.from(route.rawQuote),
                    percent: route.percent,
                    route: route.route,
                    gasModel: route.gasModel,
                    quoteToken: new Token(currencyIn.chainId, route.quoteToken.address, route.quoteToken.decimals, route.quoteToken.symbol, route.quoteToken.name),
                    tradeType: tradeType,
                    v2PoolProvider: v2PoolProvider,
                });
            case Protocol.MIXED:
                return new MixedRouteWithValidQuote({
                    amount: CurrencyAmount.fromFractionalAmount(route.amount.currency, route.amount.numerator, route.amount.denominator),
                    rawQuote: BigNumber.from(route.rawQuote),
                    sqrtPriceX96AfterList: route.sqrtPriceX96AfterList.map((num) => BigNumber.from(num)),
                    initializedTicksCrossedList: [...route.initializedTicksCrossedList],
                    quoterGasEstimate: BigNumber.from(route.gasEstimate),
                    percent: route.percent,
                    route: route.route,
                    mixedRouteGasModel: route.gasModel,
                    v2PoolProvider,
                    quoteToken: new Token(currencyIn.chainId, route.quoteToken.address, route.quoteToken.decimals, route.quoteToken.symbol, route.quoteToken.name),
                    tradeType: tradeType,
                    v3PoolProvider: v3PoolProvider,
                });
        }
    });
    const trade = buildTrade(currencyIn, currencyOut, tradeType, routesWithValidQuote);
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
        gasPriceWei: BigNumber.from(swapRoute.gasPriceWei),
        trade,
        route: routesWithValidQuotePortionAdjusted,
        blockNumber: BigNumber.from(swapRoute.blockNumber),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FzLWZhY3RvcnktaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL2dhcy1mYWN0b3J5LWhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMvQyxPQUFPLEVBQ0wsT0FBTyxFQUVQLGNBQWMsRUFDZCxLQUFLLEVBQ0wsU0FBUyxHQUNWLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFFLFNBQVMsRUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ2xELE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLENBQUMsTUFBTSxRQUFRLENBQUM7QUFVdkIsT0FBTyxFQUVMLHdCQUF3QixFQUd4QixtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLHFCQUFxQixHQUN0QixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXZELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRCxNQUFNLENBQUMsS0FBSyxVQUFVLGVBQWUsQ0FDbkMsS0FBWSxFQUNaLFlBQTZCLEVBQzdCLGNBQStCO0lBRS9CLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFrQixDQUFDO0lBQ3pDLE1BQU0sSUFBSSxHQUFHLHVCQUF1QixDQUFDLE9BQU8sQ0FBRSxDQUFDO0lBRS9DLE1BQU0sWUFBWSxHQUFHLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbEYsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENB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