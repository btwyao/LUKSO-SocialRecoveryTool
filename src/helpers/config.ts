import { NetworkInfo, NetworkType } from "@/interfaces/network";
import { ERC725JSONSchema } from "@erc725/erc725.js";

export const UP_CONNECTED_ADDRESS = "up-srt:connected-address";
export const ACCESS_BACK_ADDRESS = "up-srt:access-back-address";
export const ACCESS_BACK_PROCESS = "up-srt:access-back-process";

export const DEFAULT_GAS = 5_000_000;
export const DEFAULT_GAS_PRICE = "10";

export const MAGICVALUE = "0x1626ba7e";

export const DEFAULT_NETWORK: NetworkType = "l16";

export const NETWORKS: { [K in NetworkType]: NetworkInfo } = {
  l16: {
    name: "l16",
    rpc: {
      url: "https://rpc.l16.lukso.network",
    },
    cache: {
      url: "https://erc725cache.l16.lukso.network/graphql",
    },
    ipfs: {
      url: "https://2eff.lukso.dev/ipfs/",
    },
    blockscout: {
      url: "https://explorer.execution.l16.lukso.network/tx",
    },
    chainId: 2828,
  },
};

export const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const DEFAULT_NETWORK_CONFIG = NETWORKS[DEFAULT_NETWORK];

export const WALLET_CONNECT_VERSION = "1.0";

export const SocialRecoverySchema: ERC725JSONSchema[] = [
  {
    name: "LSP11SocialRecovery",
    key: "0xbbab553263be3bfcbf9acf680e56f3b4917c00946b141d9aee95317fd2f51484",
    keyType: "Singleton",
    valueContent: "Address",
    valueType: "address",
  },
];
