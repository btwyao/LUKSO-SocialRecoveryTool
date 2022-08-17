<script setup lang="ts">
import Connect from "./Connect.vue";
import { ref } from "vue";
import { toggle } from "@/utils/dropdown";

const burger = ref();
const menu = ref();
</script>

<template>
  <nav
    class="navbar is-white is-fixed-top"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <a class="navbar-item" href="https://lukso.network">
        <img src="@/assets/lukso.png" height="28" />
      </a>

      <a
        ref="burger"
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbar"
        @click="
          toggle(burger);
          toggle(menu);
        "
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbar" ref="menu" class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/">Home</router-link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <Suspense>
              <Connect />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
nav {
  box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%),
    0 0 0 1px rgb(10 10 10 / 2%);

  a {
    font-weight: bold;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
