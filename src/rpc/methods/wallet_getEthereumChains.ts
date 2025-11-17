import { type } from "arktype";
import { defineHandler } from "../handler";

export const ReturnType = type({
  chainId: "number",
  networkId: "number",
  name: "string",
  connected: "boolean",
  nativeCurrency: {
    name: "string",
    symbol: "string",
    decimals: "number",
  },
  icon: type({
    url: "string",
  }).array(),
  explorers: type({
    url: "string",
  }).array(),
  external: {
    wallet: {
      colors: type({
        r: "number",
        g: "number",
        b: "number",
        hex: "string",
      }).array(),
    },
  },
}).array();

export type Response = typeof ReturnType.infer;

export default defineHandler({
  method: "wallet_getEthereumChains",
  paramsValidator: type([]),
  responseValidator: ReturnType,
  handler: () => [
    {
      chainId: 1,
      networkId: 1,
      name: "Mainnet",
      connected: true,
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      icon: [
        {
          url: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
        },
      ],
      explorers: [
        {
          url: "https://etherscan.io",
        },
      ],
      external: {
        wallet: {
          colors: [
            {
              r: 0,
              g: 210,
              b: 190,
              hex: "#00d2be",
            },
          ],
        },
      },
    },
  ],
});
