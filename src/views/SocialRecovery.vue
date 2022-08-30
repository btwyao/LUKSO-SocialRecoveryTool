<script setup lang="ts">
import { useProfileStore } from "@/stores/profile";
import { useSocialRecovery } from "@/stores/socialRecovery";
import { ref, computed, onMounted } from "vue";
import { useServices } from "@/services";
import { useNotification } from "@/stores/notification";
const profileStore = useProfileStore();
const srStore = useSocialRecovery();
const notification = useNotification();
const guardians = ref("");
const guardiansThreshold = ref(0);
const plainSecret = ref("");
const isPending = ref(false);
const isSRAbnormal = ref(false);
const { socialRecoveryService } = useServices();

const hasSocialRecovery = computed(() => {
  return profileStore.addressType === "universalProfile";
});

onMounted(() => {
  notification.clearNotification();
  if (srStore.guardians.length > 0 && !guardians.value) {
    guardians.value = srStore.guardians.join(";");
  }
  if (srStore.guardiansThreshold > 0 && guardiansThreshold.value <= 0) {
    guardiansThreshold.value = srStore.guardiansThreshold;
  }
  console.log("guardians:", guardians.value);
  console.log("guardiansThreshold:", guardiansThreshold.value);
});

srStore.$subscribe(async (mutation, state) => {
  if (state.guardians.length > 0 && !guardians.value) {
    guardians.value = state.guardians.join(";");
  }
  if (state.guardiansThreshold > 0 && guardiansThreshold.value <= 0) {
    guardiansThreshold.value = state.guardiansThreshold;
  }
});

const createSRA = async () => {
  isPending.value = true;
  try {
    await socialRecoveryService.createSocialRecoveryAccount(
      guardians.value.split(";"),
      guardiansThreshold.value,
      plainSecret.value
    );
    plainSecret.value = "";
    notification.setNotification(
      "create social recovery account success.",
      "primary"
    );
  } catch (error: any) {
    console.log("createSRA err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};

const curEditTab = ref(1);
const clickEditTabs = async (tabId: number) => {
  curEditTab.value = tabId;
};

const editGuardians = async () => {
  isPending.value = true;
  try {
    await socialRecoveryService.updateGuardians(
      guardians.value.split(";"),
      guardiansThreshold.value
    );
    notification.setNotification("edit guardians success.", "primary");
  } catch (error: any) {
    console.log("updateGuardians err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};

const editPassword = async () => {
  isPending.value = true;
  try {
    await socialRecoveryService.updatePassword(plainSecret.value);
    notification.setNotification(
      "set new password success, please remind yourself, it's very important for you to get back the account.",
      "primary"
    );
  } catch (error: any) {
    console.log("updatePassword err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};

const fixSRA = async () => {
  //todo
};
</script>
<template>
  <section class="section">
    <div v-if="!hasSocialRecovery" data-testid="editSR">
      <div class="tile is-ancestor">
        <div class="tile is-child box">
          <div class="field">
            <label class="label"
              >Social recovery need universal profile account, please login with
              universal profile account firstly.</label
            >
          </div>
        </div>
      </div>
      >
    </div>
    <div v-else-if="srStore.address" data-testid="editSR">
      <div class="tabs is-centered is-large">
        <ul>
          <li
            :class="`${curEditTab === 1 ? 'is-active' : ''}`"
            @click="clickEditTabs(1)"
          >
            <a>Guardians</a>
          </li>
          <li
            :class="`${curEditTab === 2 ? 'is-active' : ''}`"
            @click="clickEditTabs(2)"
          >
            <a>Password</a>
          </li>
          <li
            v-if="isSRAbnormal"
            :class="`${curEditTab === 3 ? 'is-active' : ''}`"
            @click="clickEditTabs(3)"
          >
            <a>Fix</a>
          </li>
        </ul>
      </div>
      <div class="section">
        <div v-if="curEditTab === 1" class="columns">
          <div class="column is-8 is-offset-2 box">
            <div class="field">
              <label class="label">guardians(split by ';')</label>
              <div class="control">
                <input v-model="guardians" class="input" type="text" />
              </div>
            </div>
            <div class="field">
              <label class="label">guardiansThreshold</label>
              <div class="control">
                <input
                  v-model="guardiansThreshold"
                  class="input"
                  type="number"
                />
              </div>
            </div>
            <div class="field">
              <button
                :class="`button is-primary is-rounded mb-3 ${
                  isPending ? 'is-loading' : ''
                }`"
                :disabled="srStore.address ? undefined : true"
                data-testid="editGuardians"
                @click="editGuardians"
              >
                update guardians
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="curEditTab === 2" class="columns">
          <div class="column is-8 is-offset-2 box">
            <div class="field">
              <label class="title is-5">new password:</label>
            </div>
            <div class="field">
              <div class="control">
                <input v-model="plainSecret" class="input" type="password" />
              </div>
            </div>
            <div class="field">
              <button
                :class="`button is-primary is-rounded mb-3 ${
                  isPending ? 'is-loading' : ''
                }`"
                :disabled="srStore.address ? undefined : true"
                data-testid="editPassword"
                @click="editPassword"
              >
                change password
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="curEditTab === 3" class="columns">
          <div class="column is-8 is-offset-2 box">
            <div class="field">
              <button
                :class="`button is-primary is-rounded mb-3 ${
                  isPending ? 'is-loading' : ''
                }`"
                :disabled="srStore.address ? undefined : true"
                data-testid="fixSRA"
                @click="fixSRA"
              >
                fix social recovery account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else data-testid="createSRA">
      <div class="columns">
        <div class="column is-8 is-offset-2 box">
          <div class="field">
            <label class="title is-3"
              >You don't have social recovery account yet, register now:</label
            >
            <div class="mb-6"></div>
          </div>
          <div class="field">
            <label class="title is-5">Guardians(split by ';')</label>
            <div class="control">
              <input v-model="guardians" class="input" type="text" />
            </div>
          </div>
          <div class="field">
            <label class="title is-5">guardiansThreshold</label>
            <div class="control">
              <input v-model="guardiansThreshold" class="input" type="number" />
            </div>
          </div>
          <div class="field">
            <label class="title is-5">password</label>
            <div class="control">
              <input v-model="plainSecret" class="input" type="password" />
            </div>
          </div>
          <div class="field">
            <button
              :class="`button is-primary is-rounded mb-3 ${
                isPending ? 'is-loading' : ''
              }`"
              :disabled="!srStore.address ? undefined : true"
              data-testid="createSRA"
              @click="createSRA"
            >
              create social recovery account
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
