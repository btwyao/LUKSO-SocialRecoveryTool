<script setup lang="ts">
import { useEnv } from "@/stores/env";
import Notifications from "@/components/Notification.vue";
const envStore = useEnv();
</script>
<template>
  <section class="section">
    <div class="mb-6">
      <Notifications
        v-if="!envStore.hasExtension"
        :notification="{
          message: 'Please instal Universal Profile browser extension.',
          type: 'warning',
        }"
        :hide-notification="true"
        class="mb-4"
      ></Notifications>
    </div>
    <div class="columns">
      <div class="column is-4 is-offset-4 box">
        <div class="field column is-offset-3">
          <router-link
            class="button is-primary is-rounded mb-3"
            to="/access-back"
            >Access Back To Profile
          </router-link>
        </div>
        <div class="field column is-offset-3">
          <router-link
            class="button is-primary is-rounded mb-3"
            to="/grant-access"
            >Grant Access To Profile
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
