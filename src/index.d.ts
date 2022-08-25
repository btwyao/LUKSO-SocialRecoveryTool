import Web3 from "web3";

export {};
declare global {
  interface Window {
    ethereum: any;
    web3: Web3;
  }
}
declare module "@lukso/lsp-smart-contracts/constants";
