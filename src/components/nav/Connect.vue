<script setup lang="ts">
import { useProfileStore } from "../../stores/profile";
const profileStore = useProfileStore();
</script>

<template>
  <div v-if="profileStore.isConnected" class="field has-addons">
    <p class="control">
      <button
        class="button is-static is-small is-rounded"
        data-testid="balance"
      >
        <span>{{ profileStore.balance }} LYX</span>
      </button>
    </p>
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
