<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useServices } from "@/services";
import Navbar from "./components/nav/Navbar.vue";
const { initServices, destroyServices } = useServices();

onMounted(async () => {
  await initServices();
});

onUnmounted(async () => {
  await destroyServices();
});
</script>

<template>
  <Navbar />

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
