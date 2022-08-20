import { defineStore } from "pinia";

interface SocialRecoveryStore {
  address: string; //social recovery contract address
}

const defalutSocialRecovery: SocialRecoveryStore = {
  address: "",
};

export const useSocialRecovery = defineStore({
  id: "socialRecovery",
  state: () => defalutSocialRecovery,
  getters: {},
  actions: {},
});
