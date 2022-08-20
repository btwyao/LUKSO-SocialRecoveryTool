<script setup lang="ts">
import { computed } from "vue";
import Notifications from "@/components/Notification.vue";
const hasExtension = computed(() => {
  return window.ethereum;
});
</script>
<template>
  <Notifications
    v-if="!hasExtension"
    :notification="{
      message: 'Please instal Universal Profile browser extension.',
      type: 'warning',
    }"
    :hide-notification="true"
    class="mb-4"
  ></Notifications>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <div class="field">
        <router-link class="button is-primary is-rounded mb-3" to="/access-back"
          >Access Back To Profile
        </router-link>
      </div>
      <div class="field">
        <router-link
          class="button is-primary is-rounded mb-3"
          to="/grant-access"
          >Grant Access To Profile
        </router-link>
      </div>
    </div>
  </div>
</template>
