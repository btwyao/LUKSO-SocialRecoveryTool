import { useSocialRecovery } from "@/stores/socialRecovery";

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
    // todo
  }
}
