import Web3 from "web3";
import { Contract } from "web3-eth-contract";

export interface Errors {
  search?: string;
  amount?: string;
}

export interface Notification {
  message?: string;
  type?: string;
}

export type NotificationType = "primary" | "danger" | "info" | "warning";

export type Channel = "browserExtension" | "walletConnect";

declare global {
  interface Window {
    web3: Web3;
    erc725Account?: Contract;
    keyManager?: Contract;
    ERC725?: ERC725;
  }
}
