<script setup lang="ts">
import { useProfileStore } from "@/stores/profile";
import { useEnv } from "@/stores/env";
import { useServices } from "@/services";
import { WALLET_CONNECT_VERSION as walletConnectVersion } from "@/helpers/config";
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useNotification } from "@/stores/notification";
const profileStore = useProfileStore();
const envStore = useEnv();
const { loginService } = useServices();
const notification = useNotification();
const router = useRouter();
const route = useRoute();
const isPending = ref(false);

onMounted(() => {
  notification.clearNotification();
});

profileStore.$subscribe((mutation, state) => {
  if (state.isConnected) {
    console.log("connected");
    router.push((route.query.redirect as string) || "");
  }
});

const connectExtension = async () => {
  isPending.value = true;
  try {
    await loginService.connectExtension();
  } catch (error: any) {
    console.log("connectExtension err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};

const connectWalletConnect = async () => {
  await loginService.connectWalletConnect();
};
</script>
<template>
  <section class="section">
    <div class="mb-6"></div>
    <div class="columns">
      <div class="column is-6 is-offset-3 box">
        <div v-if="route.query.redirect" class="field">
          <label class="title">You need login firstly:</label>
        </div>
        <div class="field column is-offset-4">
          <button
            :class="`button is-primary is-rounded mb-3 ${
              isPending ? 'is-loading' : ''
            }`"
            :disabled="
              profileStore.address || !envStore.hasExtension ? true : undefined
            "
            data-testid="connect-extension"
            @click="connectExtension"
          >
            Browser Extension
          </button>
        </div>
        <!-- <div class="field">
          <button
            class="button is-primary is-rounded mb-3"
            :disabled="profileStore.address ? true : undefined"
            data-testid="connect-wc"
            @click="connectWalletConnect"
          >
            Wallet Connect {{ walletConnectVersion }}
          </button>
        </div> -->
      </div>
    </div>
  </section>
</template>
