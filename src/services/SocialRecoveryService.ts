import { useSocialRecovery } from "@/stores/socialRecovery";
import { useProfileStore, ProfileStore } from "@/stores/profile";
import LSP11BasicSocialRecovery from "@lukso/lsp-smart-contracts/artifacts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol/LSP11BasicSocialRecovery.json";
import {
  DEFAULT_GAS,
  DEFAULT_GAS_PRICE,
  SocialRecoverySchema,
} from "@/helpers/config";
import { DeployOptions } from "web3-eth-contract";
import {
  ERC725YKeys,
  // @ts-ignore
} from "@lukso/lsp-smart-contracts/constants.js";
import { ERC725 } from "@erc725/erc725.js";
import type { Permissions } from "@erc725/erc725.js/build/main/src/types/Method";
import { Contract } from "web3-eth-contract";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/contracts/UniversalProfile.sol/UniversalProfile.json";

export default class SocialRecoveryService {
  protected profileStore;
  protected socialRecoveryStore;
  protected erc725Account?: Contract;
  protected srAccount?: Contract; //social recovery account

  public constructor() {
    this.profileStore = useProfileStore();
    this.socialRecoveryStore = useSocialRecovery();
  }

  public async init(): Promise<void> {
    await this.onProfileChanged(this.profileStore);
    this.profileStore.$subscribe(async (mutation, state) => {
      await this.onProfileChanged(state);
    });
    console.log("socialRecoveryService init finish");
  }

  public async destroy(): Promise<void> {
    console.log("socialRecoveryService destroy finish");
  }

  protected isActive(): boolean {
    if (
      this.profileStore.isConnected &&
      this.profileStore.addressType === "universalProfile"
    ) {
      return true;
    }
    return false;
  }

  protected async onProfileChanged(state: ProfileStore): Promise<void> {
    if (this.isActive()) {
      this.erc725Account = new window.web3.eth.Contract(
        UniversalProfile.abi as any,
        state.address,
        {
          from: state.address,
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
      if (srAddressRes) {
        this.srAccount = new window.web3.eth.Contract(
          LSP11BasicSocialRecovery.abi as any,
          srAddressRes,
          {
            from: state.address,
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

        this.socialRecoveryStore.$patch((state) => {
          state.address = srAddressRes;
          state.guardians = guardians;
          state.guardiansThreshold = curThreshold;
        });
      } else {
        this.srAccount = undefined;
        this.socialRecoveryStore.$reset();
      }
    } else {
      this.erc725Account = undefined;
      this.srAccount = undefined;
      this.socialRecoveryStore.$reset();
    }
  }

  public async createSocialRecoveryAccount(
    guardians: Array<string>,
    guardiansThreshold: number,
    plainSecret: string
  ): Promise<void> {
    if (!this.isActive()) {
      throw new Error("Social recovery is inactive!");
    }
    if (!this.erc725Account) {
      throw new Error("Not login yet!");
    }
    if (this.srAccount) {
      throw new Error("Already has social recovery account!");
    }
    const upAddress = this.profileStore.address;
    const keyAddress = this.profileStore.keyManagerAddress;
    console.log(upAddress, keyAddress);

    // const srAddress = "0x54975192d7D43536C488bF05FacDaF564A92804f";
    let srAccount = new window.web3.eth.Contract(
      LSP11BasicSocialRecovery.abi as any,
      // srAddress,
      undefined,
      {
        from: upAddress,
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      }
    );
    srAccount = await srAccount
      .deploy({
        data: LSP11BasicSocialRecovery.bytecode,
        arguments: [upAddress],
      } as DeployOptions)
      .send({
        from: upAddress,
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      });
    const srAddress = srAccount.options.address;
    const srLinkedAddress = await srAccount.methods.account().call();
    console.log(
      srAddress,
      "social recovery linked account to recover:",
      srLinkedAddress
    );

    const key =
      ERC725YKeys["LSP6"]["AddressPermissions:Permissions"] +
      srAddress.slice(2);
    const permissions: Permissions = {
      CHANGEOWNER: false,
      CHANGEPERMISSIONS: true,
      ADDPERMISSIONS: true,
      SETDATA: false,
      CALL: false,
      STATICCALL: false,
      DELEGATECALL: false,
      DEPLOY: false,
      TRANSFERVALUE: false,
      SIGN: false,
      SUPER_SETDATA: false,
      SUPER_TRANSFERVALUE: false,
      SUPER_CALL: false,
      SUPER_STATICCALL: false,
      SUPER_DELEGATECALL: false,
    };
    const value = ERC725.encodePermissions(permissions);
    await this.erc725Account.methods["setData(bytes32,bytes)"](
      key,
      value
    ).send();
    const permissionRes = await this.erc725Account.methods["getData(bytes32)"](
      key
    ).call();
    console.log(permissionRes);
    console.log(
      "social recovery account get permissions:",
      ERC725.decodePermissions(permissionRes)
    );

    const encodedData = ERC725.encodeData(
      [
        {
          keyName: "LSP11SocialRecovery",
          value: srAddress,
        },
      ],
      SocialRecoverySchema
    );
    await this.erc725Account.methods["setData(bytes32,bytes)"](
      encodedData.keys[0],
      encodedData.values[0]
    ).send();
    const srAddressRes = await this.erc725Account.methods["getData(bytes32)"](
      encodedData.keys[0]
    ).call();
    console.log(
      "set social recovery address in universal profile account:",
      srAddressRes
    );

    const secretHash = window.web3.utils.soliditySha3({
      type: "string",
      value: plainSecret,
    });
    await srAccount.methods.setSecret(secretHash).send();
    console.log("set secret hash:", secretHash);

    for (const guardian of guardians) {
      await srAccount.methods.addGuardian(guardian).send();
      console.log("add guardian:", guardian);
    }

    await srAccount.methods.setThreshold(guardiansThreshold).send();
    console.log("set threshold:", guardiansThreshold);

    this.srAccount = srAccount;
    this.socialRecoveryStore.$patch((state) => {
      state.address = srAddress;
      state.guardians = guardians;
      state.guardiansThreshold = guardiansThreshold;
    });
  }

  public async updateGuardians(
    guardians: Array<string>,
    guardiansThreshold: number
  ): Promise<void> {
    if (!this.isActive()) {
      throw new Error("Social recovery is inactive!");
    }
    if (!this.erc725Account) {
      throw new Error("Not login yet!");
    }
    if (!this.srAccount) {
      throw new Error("Do not have social recovery account!");
    }

    const oldGuardians = (await this.srAccount.methods
      .getGuardians()
      .call()) as Array<string>;
    console.log("old guardians:", oldGuardians);
    for (const guardian of oldGuardians) {
      if (!guardians.includes(guardian)) {
        await this.srAccount.methods.removeGuardian(guardian).send();
        console.log("remove guardian:", guardian);
      }
    }
    for (const guardian of guardians) {
      if (!oldGuardians.includes(guardian)) {
        await this.srAccount.methods.addGuardian(guardian).send();
        console.log("add guardian:", guardian);
      }
    }

    const curThreshold = await this.srAccount.methods
      .getGuardiansThreshold()
      .call();
    if (parseInt(curThreshold) !== guardiansThreshold) {
      await this.srAccount.methods.setThreshold(guardiansThreshold).send();
      console.log("set threshold:", curThreshold, guardiansThreshold);
    }

    this.socialRecoveryStore.$patch((state) => {
      state.guardians = guardians;
      state.guardiansThreshold = guardiansThreshold;
    });
  }

  public async updatePassword(plainSecret: string): Promise<void> {
    if (!this.isActive()) {
      throw new Error("Social recovery is inactive!");
    }
    if (!this.erc725Account) {
      throw new Error("Not login yet!");
    }
    if (!this.srAccount) {
      throw new Error("Do not have social recovery account!");
    }

    const secretHash = window.web3.utils.soliditySha3({
      type: "string",
      value: plainSecret,
    });
    await this.srAccount.methods.setSecret(secretHash).send();
    console.log("set secret hash:", secretHash);
  }
}
