<script setup lang="ts">
import { ref, computed } from "vue";
import { useProfileStore } from "@/stores/profile";
import { useEnv } from "@/stores/env";
import { sliceAddress } from "@/utils/sliceAddress";
import { useServices } from "@/services";
import { close, toggle } from "@/utils/dropdown";
// import { WALLET_CONNECT_VERSION as walletConnectVersion } from "@/helpers/config";
const profileStore = useProfileStore();
const envStore = useEnv();
const dropdown = ref();
const { loginService } = useServices();

const hasSocialRecovery = computed(() => {
  return profileStore.addressType === "universalProfile";
});

const connectExtension = async () => {
  close(dropdown.value);
  await loginService.connectExtension();
};

// const connectWalletConnect = async () => {
//   close(dropdown.value);
//   await loginService.connectWalletConnect();
// };
</script>

<template>
  <div v-if="profileStore.isConnected" class="field has-addons">
    <p v-if="hasSocialRecovery" class="control">
      <router-link
        class="button is-small is-rounded"
        data-testid="social-recovery"
        to="/social-recovery"
      >
        <span>Social Recovery</span>
      </router-link>
    </p>
    <p class="control">
      <button
        class="button is-static is-small is-rounded"
        data-testid="balance"
      >
        <span>{{ profileStore.balance }} LYX</span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-static is-small is-rounded address"
        data-testid="address"
      >
        <div
          :class="`logo ${
            profileStore.channel === 'browserExtension'
              ? 'browser-extension'
              : 'wallet-connect'
          }`"
        />
        <span>{{ sliceAddress(profileStore.address) }}</span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-small is-rounded"
        data-testid="disconnect"
        @click="loginService.disconnect"
      >
        <span class="icon is-small">
          <i class="fas fa-sign-out-alt"></i>
        </span>
      </button>
    </p>
  </div>

  <div v-else ref="dropdown" class="dropdown is-right">
    <div class="dropdown-trigger">
      <button
        ref="dropdown"
        class="button is-primary is-small is-rounded has-text-weight-bold"
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        data-testid="connect"
        @click="toggle(dropdown)"
      >
        <span>Connect</span>
      </button>
    </div>
    <div id="dropdown-menu" class="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <button
          class="dropdown-item has-text-weight-bold button is-text"
          data-testid="connect-extension"
          :disabled="envStore.hasExtension ? undefined : true"
          @click="connectExtension"
        >
          <div class="logo browser-extension" />
          Browser Extension
        </button>
        <!-- <button
          class="dropdown-item has-text-weight-bold button is-text"
          data-testid="connect-wc"
          @click="connectWalletConnect"
        >
          <div class="logo wallet-connect" />
          Wallet Connect {{ walletConnectVersion }}
        </button> -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.logo {
  height: 16px;
  width: 30px;
  background-repeat: no-repeat;
  display: inline-flex;
  background-position: center;
  background-size: contain;
  position: relative;
  top: 3px;

  &.wallet-connect {
    background-image: url("~@/assets/walletconnect-logo.svg");
  }

  &.browser-extension {
    background-image: url("~@/assets/lukso.png");
  }
}

.dropdown-item {
  &.is-text {
    text-decoration: none;
  }
}

.address {
  .logo {
    top: 0;
    left: -7px;
    width: 20px;
  }
}
</style>
