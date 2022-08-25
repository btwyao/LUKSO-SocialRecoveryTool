import { Channel, AddressType } from "@/types.d";
import { defineStore } from "pinia";

export interface ProfileStore {
  isConnected: boolean;
  balance: number;
  channel: undefined | Channel;
  address: string;
  keyManagerAddress: string;
  chainId: number;
  addressType: undefined | AddressType;
}

export const useProfileStore = defineStore({
  id: "profile",
  state: (): ProfileStore => ({
    isConnected: false,
    balance: 0,
    channel: undefined,
    address: "",
    keyManagerAddress: "",
    chainId: 0,
    addressType: undefined,
  }),
  getters: {},
  actions: {},
});
