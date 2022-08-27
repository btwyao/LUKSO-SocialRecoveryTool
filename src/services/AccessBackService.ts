import { useAccessBack, RecoverProcess } from "@/stores/accessBack";
import { useProfileStore } from "@/stores/profile";
import {
  DEFAULT_GAS,
  DEFAULT_GAS_PRICE,
  ACCESS_BACK_ADDRESS,
  ACCESS_BACK_PROCESS,
  SocialRecoverySchema,
} from "@/helpers/config";
import { Contract } from "web3-eth-contract";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/contracts/UniversalProfile.sol/UniversalProfile.json";
import { ERC725 } from "@erc725/erc725.js";
import LSP11BasicSocialRecovery from "@lukso/lsp-smart-contracts/artifacts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol/LSP11BasicSocialRecovery.json";
import Web3 from "web3";

export default class AccessBackService {
  protected profileStore;
  protected acessBackStore;
  protected erc725Account?: Contract; //the universal profile account need to get back
  protected srAccount?: Contract; //social recovery account relate to the universal profile account need get back

  public constructor() {
    this.profileStore = useProfileStore();
    this.acessBackStore = useAccessBack();
  }

  public async init(): Promise<void> {
    await this.loadAccessBackAddress();
    this.profileStore.$subscribe(async (mutation, state) => {
      if (state.isConnected) {
        await this.loadAccessBackAddress();
        if (this.acessBackStore.upAddress) {
          await this.innerSetAccessBackAddress(this.acessBackStore.upAddress);
        }
      } else {
        this.erc725Account = undefined;
        this.srAccount = undefined;
        this.acessBackStore.$reset();
      }
    });
    console.log("AccessBackService init finish");
  }

  public async destroy(): Promise<void> {
    console.log("AccessBackService destroy finish");
  }

  protected async loadAccessBackAddress(): Promise<void> {
    try {
      const cacheAddress = localStorage.getItem(ACCESS_BACK_ADDRESS);
      if (cacheAddress) {
        const addressMap = JSON.parse(cacheAddress);
        const accessBackAddress = addressMap[this.profileStore.address];
        if (accessBackAddress) {
          await this.innerSetAccessBackAddress(accessBackAddress);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  protected saveAccessBackAddress(): void {
    let addressMap: any = {};
    try {
      const cacheAddress = localStorage.getItem(ACCESS_BACK_ADDRESS);
      if (cacheAddress) {
        addressMap = JSON.parse(cacheAddress);
      }
    } catch (error) {
      console.log(error);
    }
    addressMap[this.profileStore.address] = this.acessBackStore.upAddress;
    localStorage.setItem(ACCESS_BACK_ADDRESS, JSON.stringify(addressMap));
  }

  protected async innerSetAccessBackAddress(upAddress: string): Promise<void> {
    if (!this.profileStore.isConnected) {
      return;
    }
    console.log("innerSetAccessBackAddress:", upAddress);
    this.erc725Account = new window.web3.eth.Contract(
      UniversalProfile.abi as any,
      upAddress,
      {
        from: this.profileStore.address,
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      }
    );
    const encodedData = ERC725.encodeData(
      [
        {
          keyName: "LSP11SocialRecovery",
          value: "",
        },
      ],
      SocialRecoverySchema
    );
    const srAddressRes = await this.erc725Account.methods["getData(bytes32)"](
      encodedData.keys[0]
    ).call();
    if (!srAddressRes) {
      throw new Error(
        "The universal profile account do not set the social recovery account yet"
      );
    }
    this.srAccount = new window.web3.eth.Contract(
      LSP11BasicSocialRecovery.abi as any,
      srAddressRes,
      {
        from: this.profileStore.address,
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      }
    );

    const guardians = (await this.srAccount.methods
      .getGuardians()
      .call()) as Array<string>;
    const curThreshold = await this.srAccount.methods
      .getGuardiansThreshold()
      .call();

    this.acessBackStore.$patch((state) => {
      state.upAddress = upAddress;
      state.guardianAddressList = guardians;
      state.guardianThreshold = curThreshold;
    });
    this.saveAccessBackAddress();

    this.loadAccessBackProcess();
    await this.refreshAccessBackProcess();
    this.saveAccessBackProcess();
  }

  protected loadAccessBackProcess(): void {
    try {
      // localStorage.setItem(ACCESS_BACK_PROCESS, "");
      const cacheProcess = localStorage.getItem(ACCESS_BACK_PROCESS);
      if (cacheProcess) {
        const processMap = JSON.parse(cacheProcess);
        const cacheProcessList = processMap[
          this.acessBackStore.upAddress + "|" + this.profileStore.address
        ] as Array<RecoverProcess>;
        if (cacheProcessList) {
          const processMap: any = {};
          for (const process of cacheProcessList) {
            processMap[process.processId] = process;
          }
          this.acessBackStore.recoverProcessList = Object.values(processMap);
          console.log(
            "loadAccessBackProcess",
            this.acessBackStore.recoverProcessList
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  protected saveAccessBackProcess(): void {
    let processMap: any = {};
    try {
      const cacheProcess = localStorage.getItem(ACCESS_BACK_PROCESS);
      if (cacheProcess) {
        processMap = JSON.parse(cacheProcess);
      }
    } catch (error) {
      console.log(error);
    }
    processMap[
      this.acessBackStore.upAddress + "|" + this.profileStore.address
    ] = this.acessBackStore.recoverProcessList;
    localStorage.setItem(ACCESS_BACK_PROCESS, JSON.stringify(processMap));
  }

  protected async refreshAccessBackProcess(): Promise<void> {
    if (!this.srAccount) {
      return;
    }
    const newProcessList: Array<RecoverProcess> = [];
    const processIds = (
      (await this.srAccount.methods
        .getRecoverProcessesIds()
        .call()) as Array<string>
    ).map((processId) => Web3.utils.hexToUtf8(processId));
    console.log("getRecoverProcessesIds: ", processIds);
    for (const processId of processIds) {
      const guardiansVoted: Array<string> = [];
      for (const guardianAddress of this.acessBackStore.guardianAddressList) {
        const voteAddress = await this.srAccount.methods
          .getGuardianVote(Web3.utils.utf8ToHex(processId), guardianAddress)
          .call();
        console.log(
          "getGuardianVote: ",
          processId,
          guardianAddress,
          voteAddress
        );
        if (this.profileStore.address === voteAddress) {
          guardiansVoted.push(guardianAddress);
        }
      }
      newProcessList.push({
        processId,
        guardiansVoted,
        grantAccessUrl: this.genGrantAccessUrl(processId),
      });
    }
    for (const process of this.acessBackStore.recoverProcessList) {
      if (
        !processIds.includes(process.processId) &&
        process.guardiansVoted.length <= 0
      ) {
        newProcessList.push(process);
      }
    }
    this.acessBackStore.recoverProcessList = newProcessList;
  }

  public async setUPAddress(upAddress: string): Promise<void> {
    if (!this.profileStore.isConnected) {
      throw new Error("Not login yet!");
    }
    if (upAddress === this.acessBackStore.upAddress) {
      return;
    }
    await this.innerSetAccessBackAddress(upAddress);
  }

  protected genGrantAccessUrl(processId: string): string {
    return (
      window.location.host +
      `/grant-access?upAddress=${this.acessBackStore.upAddress}&recoverProcessId=${processId}&newOwnerAddress=${this.profileStore.address}`
    );
  }

  public async createRecoverProcess(processId: string): Promise<void> {
    if (!this.profileStore.isConnected) {
      throw new Error("Not login yet!");
    }
    if (!this.erc725Account) {
      throw new Error("Do not set universal profile account to get back yet!");
    }
    for (const process of this.acessBackStore.recoverProcessList) {
      if (process.processId === processId) {
        return;
      }
    }
    this.acessBackStore.recoverProcessList.push({
      processId: processId,
      guardiansVoted: [],
      grantAccessUrl: this.genGrantAccessUrl(processId),
    });
    this.saveAccessBackProcess();
  }

  public async recoverOwnership(
    recoverProcessId: string,
    password: string,
    newPassword: string
  ): Promise<void> {
    if (!this.profileStore.isConnected) {
      throw new Error("Not login yet!");
    }
    if (!this.srAccount) {
      throw new Error("Do not set universal profile account to get back yet!");
    }
    const secretHash = window.web3.utils.soliditySha3({
      type: "string",
      value: newPassword,
    });
    console.log("set new secret hash:", secretHash);
    await this.srAccount.methods
      .recoverOwnership(
        Web3.utils.utf8ToHex(recoverProcessId),
        password,
        secretHash
      )
      .send();

    this.acessBackStore.recoverProcessList = [];
    await this.refreshAccessBackProcess();
    this.saveAccessBackProcess();
  }
}
