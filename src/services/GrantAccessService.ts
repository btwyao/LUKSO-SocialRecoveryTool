import { useProfileStore } from "@/stores/profile";
import {
  DEFAULT_GAS,
  DEFAULT_GAS_PRICE,
  SocialRecoverySchema,
} from "@/helpers/config";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/contracts/UniversalProfile.sol/UniversalProfile.json";
import { ERC725 } from "@erc725/erc725.js";
import LSP11BasicSocialRecovery from "@lukso/lsp-smart-contracts/artifacts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol/LSP11BasicSocialRecovery.json";
import Web3 from "web3";

export default class GrantAccessService {
  protected profileStore;

  public constructor() {
    this.profileStore = useProfileStore();
  }

  public async init(): Promise<void> {
    console.log("GrantAccessService init finish");
  }

  public async destroy(): Promise<void> {
    console.log("GrantAccessService destroy finish");
  }

  public async vote(
    upAddress: string,
    recoverProcessId: string,
    newOwnerAddress: string
  ): Promise<void> {
    if (!this.profileStore.isConnected) {
      throw new Error("Not login yet!");
    }
    const erc725Account = new window.web3.eth.Contract(
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
    const srAddressRes = await erc725Account.methods["getData(bytes32)"](
      encodedData.keys[0]
    ).call();
    if (!srAddressRes) {
      throw new Error(
        "The universal profile account do not set the social recovery account!"
      );
    }
    const srAccount = new window.web3.eth.Contract(
      LSP11BasicSocialRecovery.abi as any,
      srAddressRes,
      {
        from: this.profileStore.address,
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      }
    );

    const guardians = (await srAccount.methods
      .getGuardians()
      .call()) as Array<string>;
    if (!guardians.includes(this.profileStore.address)) {
      throw new Error(
        "You are not the guardian of this social recovery account!"
      );
    }
    await srAccount.methods
      .voteToRecover(Web3.utils.utf8ToHex(recoverProcessId), newOwnerAddress)
      .send();
  }
}
