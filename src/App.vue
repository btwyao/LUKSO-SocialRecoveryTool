<script setup lang="ts">
import { onBeforeMount, onUnmounted } from "vue";
import { useServices } from "@/services";
import Navbar from "./components/nav/Navbar.vue";
import { useProfileStore } from "@/stores/profile";
import { useRoute, useRouter } from "vue-router";
import Notifications from "@/components/Notification.vue";
import { useNotification } from "@/stores/notification";
const { initServices, destroyServices } = useServices();
const profileStore = useProfileStore();
const router = useRouter();
const route = useRoute();
const notification = useNotification();

profileStore.$subscribe((mutation, state) => {
  if (route.path === "/" || route.path === "/login") {
    return;
  }
  if (!state.isConnected) {
    console.log("disconnected");
    router.push("/");
  }
});

onBeforeMount(async () => {
  await initServices();
});

onUnmounted(async () => {
  await destroyServices();
});
</script>

<template>
  <Navbar />
  <div class="mb-6">
    <Notifications
      v-if="notification.hasNotification"
      :notification="notification.notification"
      :hide-notification="notification.hideNotification"
      class="mb-4"
      @hide="notification.clearNotification"
    ></Notifications>
  </div>
  <Suspense>
    <router-view></router-view>
  </Suspense>
</template>

<style lang="scss">
html {
  background-color: #f2f2f2 !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
