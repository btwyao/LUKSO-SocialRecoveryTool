import { defineStore } from "pinia";

export const useProfileStore = defineStore({
  id: "profile",
  state: () => ({
    isConnected: false,
    balance: 0,
  }),
  getters: {},
  actions: {},
});
