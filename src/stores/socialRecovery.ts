import { defineStore } from "pinia";

interface SocialRecoveryStore {
  address: string; //social recovery contract address
}

export const useSocialRecovery = defineStore({
  id: "socialRecovery",
  state: (): SocialRecoveryStore => ({
    address: "",
  }),
  getters: {},
  actions: {},
});
