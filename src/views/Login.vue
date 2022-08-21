<script setup lang="ts">
import { useProfileStore } from "@/stores/profile";
import { useEnv } from "@/stores/env";
import { useServices } from "@/services";
import { WALLET_CONNECT_VERSION as walletConnectVersion } from "@/helpers/config";
import { useRoute, useRouter } from "vue-router";
const profileStore = useProfileStore();
const envStore = useEnv();
const { loginService } = useServices();
const router = useRouter();
const route = useRoute();

profileStore.$subscribe((mutation, state) => {
  if (state.isConnected) {
    console.log("connected");
    router.push((route.query.redirect as string) || "");
  }
});

const connectExtension = async () => {
  await loginService.connectExtension();
};

const connectWalletConnect = async () => {
  await loginService.connectWalletConnect();
};
</script>
<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <div v-if="route.query.redirect" class="field">
        <label class="label">You need login firstly</label>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="
            profileStore.address || !envStore.hasExtension ? true : undefined
          "
          data-testid="connect-extension"
          @click="connectExtension"
        >
          Browser Extension
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="profileStore.address ? true : undefined"
          data-testid="connect-wc"
          @click="connectWalletConnect"
        >
          Wallet Connect {{ walletConnectVersion }}
        </button>
      </div>
    </div>
  </div>
</template>
