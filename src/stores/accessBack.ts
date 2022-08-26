import { defineStore } from "pinia";

export interface RecoverProcess {
  processId: string;
  guardiansVoted: Array<string>;
  grantAccessUrl: string;
}

interface AccessBackStore {
  upAddress: string; // Universal Profile address
  guardianAddressList: Array<string>;
  guardianThreshold: number;
  recoverProcessList: Array<RecoverProcess>;
}

export const useAccessBack = defineStore({
  id: "accessBack",
  state: (): AccessBackStore => ({
    upAddress: "",
    guardianAddressList: [],
    guardianThreshold: 0,
    recoverProcessList: [],

    // upAddress: "upaddress",
    // guardianAddressList: ["guardian1", "guardian2", "guardian3"],
    // guardianThreshold: 2,
    // recoverProcessList: [
    //   {
    //     processId: "process1",
    //     guardiansVoted: ["guardian1"],
    //     grantAccessUrl: "processURL1",
    //   },
    //   {
    //     processId: "process2",
    //     guardiansVoted: ["guardian1", "guardian2"],
    //     grantAccessUrl: "processURL2",
    //   },
    //   {
    //     processId: "process3",
    //     guardiansVoted: ["guardian1", "guardian2", "guardian3"],
    //     grantAccessUrl: "processURL3",
    //   },
    // ],
  }),
  getters: {},
  actions: {},
});
