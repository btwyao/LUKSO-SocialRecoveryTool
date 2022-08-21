import { Channel, AddressType } from "./../types.d";
import { defineStore } from "pinia";

interface ProfileStore {
  isConnected: boolean;
  balance: number;
  channel: undefined | Channel;
  address: string;
  chainId: number;
  socialRecoveryAddress: string;
  addressType: undefined | AddressType;
}

export const useProfileStore = defineStore({
  id: "profile",
  state: (): ProfileStore => ({
    isConnected: false,
    balance: 0,
    channel: undefined,
    address: "",
    chainId: 0,
    socialRecoveryAddress: "",
    addressType: undefined,
  }),
  getters: {},
  actions: {},
});
