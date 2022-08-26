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
    const cacheAddress = localStorage.getItem(ACCESS_BACK_ADDRESS);
    if (cacheAddress) {
      await this.setUPAddress(cacheAddress, true);
    }
    this.profileStore.$subscribe(async (mutation, state) => {
      if (state.isConnected) {
        if (this.acessBackStore.upAddress) {
          await this.setUPAddress(this.acessBackStore.upAddress, true);
        }
      } else {
        this.erc725Account = undefined;
        this.srAccount = undefined;
      }
    });
    console.log("AccessBackService init finish");
  }

  public async destroy(): Promise<void> {
    console.log("AccessBackService destroy finish");
  }

  protected loadAccessBackProcess(): void {
    try {
      const cacheProcess = localStorage.getItem(ACCESS_BACK_PROCESS);
      if (cacheProcess) {
        const processMap = JSON.parse(cacheProcess);
        const cacheProcessList = processMap[
          this.acessBackStore.upAddress
        ] as Array<RecoverProcess>;
        if (cacheProcessList) {
          this.acessBackStore.recoverProcessList = cacheProcessList;
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
    processMap[this.acessBackStore.upAddress] =
      this.acessBackStore.recoverProcessList;
    localStorage.setItem(ACCESS_BACK_PROCESS, JSON.stringify(processMap));
  }

  protected async refreshAccessBackProcess(): Promise<void> {
    if (!this.srAccount) {
      return;
    }
    const newProcessList: Array<RecoverProcess> = [];
    const processIds = (await this.srAccount.methods
      .getRecoverProcessesIds()
      .call()) as Array<string>;
    for (const processId of processIds) {
      const guardiansVoted: Array<string> = [];
      for (const guardianAddress of this.acessBackStore.guardianAddressList) {
        const voteAddress = await this.srAccount.methods.getGuardianVote(
          processId,
          guardianAddress
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
      if (!processIds.includes(process.processId)) {
        newProcessList.push(process);
      }
    }
    this.acessBackStore.recoverProcessList = newProcessList;
  }

  public async setUPAddress(upAddress: string, force: boolean): Promise<void> {
    if (!this.profileStore.isConnected) {
      throw new Error("Not login yet!");
    }
    if (upAddress === this.acessBackStore.upAddress && !force) {
      return;
    }
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
    localStorage.setItem(ACCESS_BACK_ADDRESS, upAddress);

    this.loadAccessBackProcess();
    await this.refreshAccessBackProcess();
    this.saveAccessBackProcess();
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
}
