<script setup lang="ts">
import { useEnv } from "@/stores/env";
import { useNotification } from "@/stores/notification";
import { onMounted } from "vue";
const envStore = useEnv();
const notification = useNotification();

onMounted(() => {
  notification.clearNotification();
  if (!envStore.hasExtension) {
    notification.setNotification(
      "Please install Universal Profile browser extension.",
      "warning",
      true
    );
  }
});
</script>
<template>
  <section class="section">
    <div class="mb-6"></div>
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
