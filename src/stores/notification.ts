import { defineStore } from "pinia";
import { Notification, NotificationType } from "@/types";

interface NotificationStore {
  notification: Notification;
  hideNotification: boolean;
}

export const useNotification = defineStore({
  id: "notification",
  state: (): NotificationStore => ({
    notification: {},
    hideNotification: false,
  }),
  getters: {
    hasNotification(state) {
      return Boolean(state.notification.message);
    },
  },
  actions: {
    setNotification(
      message: string,
      type: NotificationType = "primary",
      hideNotification = false
    ) {
      this.notification = { message, type };
      this.hideNotification = hideNotification;
    },
    clearNotification() {
      this.$reset();
    },
  },
});
