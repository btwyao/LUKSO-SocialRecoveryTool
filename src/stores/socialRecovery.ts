import { defineStore } from "pinia";

interface SocialRecoveryStore {
  address: string; //social recovery contract address
  guardians: Array<string>;
  guardiansThreshold: number;
}

export const useSocialRecovery = defineStore({
  id: "socialRecovery",
  state: (): SocialRecoveryStore => ({
    address: "",
    guardians: [],
    guardiansThreshold: 0,
  }),
  getters: {},
  actions: {},
});
