import { defineStore } from "pinia";

interface SocialRecoveryProfile {
  address: string; //social recovery contract address
}

const defalutProfile: SocialRecoveryProfile = {
  address: "",
};

export const useSocialRecovery = defineStore({
  id: "socialRecovery",
  state: () => defalutProfile,
  getters: {},
  actions: {},
});
