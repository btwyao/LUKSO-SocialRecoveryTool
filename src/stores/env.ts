import { defineStore } from "pinia";

interface EnvStore {
  hasExtension: boolean; //has Universal Profile browser extension
}

export const useEnv = defineStore({
  id: "env",
  state: (): EnvStore => ({
    hasExtension: !!window.ethereum,
  }),
  getters: {},
  actions: {},
});
