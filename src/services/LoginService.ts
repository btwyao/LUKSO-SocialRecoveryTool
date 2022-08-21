import { useProfileStore } from "@/stores/profile";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { provider as Provider } from "web3-core";
import { Channel, AddressType } from "@/types";
import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/universalprofile-smart-contracts/artifacts/LSP6KeyManager.json";
import {
  DEFAULT_GAS,
  DEFAULT_GAS_PRICE,
  UP_CONNECTED_ADDRESS,
  DEFAULT_NETWORK_CONFIG,
} from "@/helpers/config";
import { EthereumProviderError } from "eth-rpc-errors";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default class LoginService {
  protected profileStore;
  protected web3!: Web3;
  protected provider?: WalletConnectProvider;
  protected erc725Account?: Contract;
  protected keyManager?: Contract;
  handleAccountsChanged: (accounts: string[]) => void;
  handleChainChanged: (chainId: string) => void;
  handleConnect: () => void;
  handleDisconnect: () => void;

  public constructor() {
    this.profileStore = useProfileStore();
    this.handleAccountsChanged = async (accounts: string[]) => {
      console.log("extension connect account changed", accounts);

      if (accounts.length === 0 && this.profileStore.isConnected) {
        await this.disconnect();
      }
    };

    this.handleChainChanged = (chainId: string) => {
      console.log("Chain changed", chainId);

      window.location.reload();
    };

    this.handleConnect = () => {
      console.log("Connected");
    };

    this.handleDisconnect = () => {
      console.log("Disconnected");
    };
  }

  public async init(): Promise<void> {
    const browserExtensionConnected =
      localStorage.getItem(UP_CONNECTED_ADDRESS);
    await this.setupProvider();

    if (this.provider?.wc.connected) {
      await this.enableProvider();
    } else if (browserExtensionConnected) {
      await this.connectExtension();
    }

    window.ethereum?.on("accountsChanged", this.handleAccountsChanged);
    window.ethereum?.on("chainChanged", this.handleChainChanged);
    window.ethereum?.on("connect", this.handleConnect);
    window.ethereum?.on("disconnect", this.handleDisconnect);
    console.log("loginService init finish");
  }

  public async destroy(): Promise<void> {
    window.ethereum?.removeListener(
      "accountsChanged",
      this.handleAccountsChanged
    );
    window.ethereum?.removeListener("chainChanged", this.handleChainChanged);
    window.ethereum?.removeListener("connect", this.handleConnect);
    window.ethereum?.removeListener("disconnect", this.handleDisconnect);
    console.log("loginService destroy finish");
  }

  protected setupWeb3(provider: Provider): void {
    this.web3 = new Web3(provider);
  }

  protected async accounts(): Promise<string> {
    const [account] = await this.web3.eth.getAccounts();
    return account;
  }

  protected async requestAccounts(): Promise<string[]> {
    const accountsRequest: string[] = await this.web3.eth.requestAccounts();
    return accountsRequest;
  }

  protected async setConnected(
    address: string,
    channel: Channel
  ): Promise<void> {
    if (this.web3.eth.accounts.wallet.length > 0) {
      console.log("Key address:", this.web3.eth.accounts.wallet[0].address);
    }
    let addressType: AddressType = "universalProfile";
    const code = await this.web3.eth.getCode(address);
    if (code === "0x") {
      addressType = "externallyOwnedAccounts";
    } else {
      try {
        this.erc725Account = new this.web3.eth.Contract(
          UniversalProfile.abi as any,
          address,
          {
            gas: DEFAULT_GAS,
            gasPrice: DEFAULT_GAS_PRICE,
          }
        );
        const upOwner = await this.erc725Account.methods.owner().call();
        this.keyManager = new this.web3.eth.Contract(
          KeyManager.abi as any,
          upOwner,
          {
            gas: DEFAULT_GAS,
            gasPrice: DEFAULT_GAS_PRICE,
          }
        );
      } catch (error) {
        console.log("set erc725Account err:", error);
        addressType = "otherContactAccount";
      }
    }
    console.log("connect address type:", addressType);

    const chainId = await this.web3.eth.getChainId();
    const wei = await this.web3.eth.getBalance(address);
    const balance = parseFloat(this.web3.utils.fromWei(wei));
    this.profileStore.$patch((state) => {
      state.address = address;
      state.isConnected = true;
      state.channel = channel;
      state.chainId = chainId;
      state.balance = balance;
      state.addressType = addressType;
    });
  }

  protected async setupProvider(): Promise<void> {
    this.provider = new WalletConnectProvider({
      rpc: {
        22: DEFAULT_NETWORK_CONFIG.rpc.url,
      },
      bridge: "https://safe-walletconnect.gnosis.io",
      chainId: 22,
    });

    this.provider.on("connect", (error: any) => {
      if (error) {
        return console.log("wallet connect err:" + error);
      }

      console.log("wallet connect");
    });

    this.provider.on("accountsChanged", async (accounts: string[]) => {
      console.log("wallet connect account changed", accounts);

      if (accounts.length === 0) {
        if (
          this.profileStore.isConnected &&
          this.profileStore.channel === "walletConnect"
        ) {
          return await this.disconnect();
        } else {
          return await this.provider?.disconnect();
        }
      }

      const [address] = accounts;

      await this.setConnected(address, "walletConnect");
    });

    this.setupWeb3(this.provider as unknown as Provider);
  }

  protected async enableProvider(): Promise<void> {
    await this.provider?.enable();
  }

  public async disconnect(): Promise<void> {
    console.log("disconnect");
    if (this.profileStore.channel === "walletConnect") {
      await this.provider?.disconnect();
    } else {
      localStorage.removeItem(UP_CONNECTED_ADDRESS);
    }

    this.erc725Account = undefined;
    this.keyManager = undefined;
    this.setupWeb3(null);
    this.profileStore.$reset();
    console.log("disconnect finish", this.profileStore.isConnected);
  }

  public async connectExtension(): Promise<void> {
    try {
      this.setupWeb3(window.ethereum);
      let address = await this.accounts();
      if (!address) {
        [address] = await this.requestAccounts();
      }
      await this.setConnected(address, "browserExtension");
      localStorage.setItem(UP_CONNECTED_ADDRESS, address);
    } catch (error) {
      const epError = error as EthereumProviderError<Error>;

      if (epError.code === 4100) {
        const address = (await this.requestAccounts())[0];
        await this.setConnected(address, "browserExtension");
        localStorage.setItem(UP_CONNECTED_ADDRESS, address);
      }
    }
  }

  public async connectWalletConnect(): Promise<void> {
    try {
      await this.setupProvider();
      await this.enableProvider();
    } catch (error) {
      console.log(error);
    }
  }
}
