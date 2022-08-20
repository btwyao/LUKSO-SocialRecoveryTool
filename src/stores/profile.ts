import { Channel } from "./../types.d";
import { defineStore } from "pinia";

interface ProfileStore {
  isConnected: boolean;
  balance: number;
  channel: undefined | Channel;
  address: string;
  chainId: number;
  socialRecoveryAddress: string;
}

const defalutProfile: ProfileStore = {
  isConnected: false,
  balance: 0,
  channel: undefined,
  address: "",
  chainId: 0,
  socialRecoveryAddress: "",
};

export const useProfileStore = defineStore({
  id: "profile",
  state: () => defalutProfile,
  getters: {},
  actions: {},
});
