import { useSocialRecovery } from "@/stores/socialRecovery";
import { useServices } from "@/services";
import LSP11BasicSocialRecovery from "@lukso/lsp-smart-contracts/artifacts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol/LSP11BasicSocialRecovery.json";
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from "@/helpers/config";
import Web3Utils from "web3-utils";
import { DeployOptions } from "web3-eth-contract";
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  // @ts-ignore
} from "@lukso/lsp-smart-contracts/constants.js";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import type { Permissions } from "@erc725/erc725.js/build/main/src/types/Method";

export default class SocialRecoveryService {
  protected socialRecoveryStore;
  public constructor() {
    this.socialRecoveryStore = useSocialRecovery();
  }

  public async init(): Promise<void> {
    console.log("socialRecoveryService init finish");
  }

  public async destroy(): Promise<void> {
    console.log("socialRecoveryService destroy finish");
  }

  public async createSocialRecoveryAccount(
    guardians: Array<string>,
    guardiansThreshold: number,
    plainSecret: string
  ): Promise<void> {
    const { loginService } = useServices();
    if (!loginService.erc725Account) {
      throw new Error("Not login yet!");
    }
    const upAddress = loginService.profileStore.address;
    const keyAddress = loginService.profileStore.keyManagerAddress;
    console.log(upAddress, keyAddress);

    // const srAddress = "0x54975192d7D43536C488bF05FacDaF564A92804f";
    let srAccount = new loginService.web3.eth.Contract(
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
    const srLinkedAddress = await srAccount.methods.account().call();
    console.log(
      srAccount,
      "social recovery linked account to recover:",
      srLinkedAddress
    );

    const key =
      ERC725YKeys["LSP6"]["AddressPermissions:Permissions"] +
      srAccount.options.address.slice(2);
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
    await loginService.erc725Account.methods["setData(bytes32,bytes)"](
      key,
      value
    ).send({
      from: upAddress,
    });
    const permissionRes = await loginService.erc725Account.methods[
      "getData(bytes32)"
    ](key).call();
    console.log(permissionRes);
    console.log(
      "social recovery account get permissions:",
      ERC725.decodePermissions(permissionRes)
    );

    const oldGuardians = (await srAccount.methods
      .getGuardians()
      .call()) as Array<string>;
    for (const guardian of guardians) {
      if (!oldGuardians.includes(guardian)) {
        await srAccount.methods.addGuardian(guardian).send({
          from: upAddress,
        });
        console.log("add guardian:", guardian);
      }
    }

    await srAccount.methods.setThreshold(guardiansThreshold).send({
      from: upAddress,
    });
    const curThreshold = await srAccount.methods.getGuardiansThreshold().call();
    console.log("set threshold:", curThreshold);

    const secretHash = loginService.web3.utils.soliditySha3(plainSecret);
    await srAccount.methods.setSecret(secretHash).send({
      from: upAddress,
    });
    console.log("set secret hash:", secretHash);
  }
}
