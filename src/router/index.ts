import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/Home.vue";
import LoginView from "@/views/Login.vue";
import SocialRecoveryView from "@/views/SocialRecovery.vue";
import AccessBackView from "@/views/AccessBack.vue";
import { useProfileStore } from "@/stores/profile";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/social-recovery",
      name: "social-recovery",
      component: SocialRecoveryView,
    },
    {
      path: "/access-back",
      name: "access-back",
      component: AccessBackView,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const invalid = !to.matched || to.matched.length === 0;
  if (invalid) {
    next({ path: "/" });
    return;
  }
  const profileStore = useProfileStore();
  if (profileStore.isConnected) {
    if (to.path === "/login") {
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    if (to.path === "/" || to.path === "/login") {
      next();
    } else {
      next({ path: "/login", query: { redirect: to.fullPath } });
    }
  }
});

export default router;
