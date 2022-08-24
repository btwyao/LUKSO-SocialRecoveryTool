<script setup lang="ts">
import { Tabs, Tab } from "vue3-tabs-component";
import { useProfileStore } from "@/stores/profile";
import { useSocialRecovery } from "@/stores/socialRecovery";
import { ref, computed } from "vue";
import { useServices } from "@/services";
const profileStore = useProfileStore();
const srStore = useSocialRecovery();
const guardians = ref("");
const guardiansThreshold = ref(0);
const plainSecret = ref("");
const oldPlainSecret = ref("");
const isPending = ref(false);
const isSRAbnormal = ref(false);
const { socialRecoveryService } = useServices();

const hasSocialRecovery = computed(() => {
  return profileStore.addressType === "universalProfile";
});

const createSRA = async () => {
  isPending.value = true;
  try {
    await socialRecoveryService.createSocialRecoveryAccount(
      guardians.value.split(";"),
      guardiansThreshold.value,
      plainSecret.value
    );
  } catch (error) {
    console.log("createSRA err:", error);
  }
  isPending.value = false;
};

const editGuardians = async () => {
  //todo
};

const editPassword = async () => {
  //todo
};

const fixSRA = async () => {
  //todo
};
</script>
<template>
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
    <tabs
      wrapper-class="panel"
      nav-class="panel-tabs is-large"
      panels-wrapper-class="section"
    >
      <tab name="guardians" panel-class="panel-block">
        <div class="tile is-4 is-parent">
          <div class="tile is-child box">
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
      </tab>
      <tab name="password" panel-class="panel-block">
        <div class="tile is-4 is-parent">
          <div class="tile is-child box">
            <div class="field">
              <label class="label">old password</label>
              <div class="control">
                <input v-model="oldPlainSecret" class="input" type="text" />
              </div>
            </div>
            <div class="field">
              <label class="label">new password</label>
              <div class="control">
                <input v-model="plainSecret" class="input" type="text" />
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
      </tab>
      <tab
        v-if="isSRAbnormal"
        name="fix social recovery account"
        panel-class="panel-block"
      >
        <div class="tile is-4 is-parent">
          <div class="tile is-child box">
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
      </tab>
    </tabs>
  </div>
  <div v-else data-testid="createSRA">
    <div class="tile is-4 is-parent">
      <div class="tile is-child box">
        <div class="field">
          <label class="label"
            >You don't have social recovery account yet, register now:</label
          >
        </div>
        <div class="field">
          <label class="label">guardians(split by ';')</label>
          <div class="control">
            <input v-model="guardians" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">guardiansThreshold</label>
          <div class="control">
            <input v-model="guardiansThreshold" class="input" type="number" />
          </div>
        </div>
        <div class="field">
          <label class="label">password</label>
          <div class="control">
            <input v-model="plainSecret" class="input" type="text" />
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
</template>
