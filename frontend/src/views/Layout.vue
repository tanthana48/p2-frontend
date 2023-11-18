<template>
  <v-app>
    <v-app-bar app color="#2C2C2C">
      <v-spacer></v-spacer>
      <v-btn text color="white" @click="toggleNotificationsDropdown">
        <v-icon>mdi-bell</v-icon>
        Notifications
        <v-badge :content="unreadNotificationsCount" color="red" overlap>
          <span class="badge-custom">{{ unreadNotificationsCount }}</span>
        </v-badge>
      </v-btn>

      <v-menu
        v-model="notificationsDropdownOpen"
        attach="#notifications-button"
        bottom
      >
        <v-list>
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            @click="markNotificationAsRead(notification.id)"
          >
            <v-list-item-content>
              {{ notification.message }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn text color="white" @click="uploadAction">
        <v-icon left>mdi-upload</v-icon>
        Upload
      </v-btn>

      <v-btn text color="white" @click="myVideo">
        <v-icon left>mdi mdi-video</v-icon>
        My Videos
      </v-btn>

      <v-btn text color="error" @click="logout">
        <v-icon> mdi mdi-logout </v-icon>
        Logout
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer class="#212121" dark app width="180">
      <v-list>
        <v-list-item class="pl-1">
          <v-list-item-icon class="ml-0 my-2 mr-3">
            <v-icon x-large>mdi mdi-music-box-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>TIKTOK</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="upload">
          <v-list-item-icon>
            <v-icon>mdi-upload</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Upload</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="video">
          <v-list-item-icon>
            <v-icon>mdi mdi-video</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>My Video</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
<script>
import Vue from "vue";
import { setupSocketListeners } from "@/services/socket.js";

export default {
  data() {
    return {
      notificationsDropdownOpen: false,
      notificationsDialog: false,
      notifications: [],
      unreadNotificationsCount: 0,
    };
  },
  watch: {
    notifications(notifications) {
      if (notifications.length > 0) {
        this.unreadNotificationsCount = notifications.filter(
          (n) => !n.read
        ).length;
      } else {
        this.unreadNotificationsCount = 0;
      }
    },
  },
  computed: {
    unreadNotificationsCount() {
      return Array.isArray(this.notifications)
        ? this.notifications.filter((n) => !n.read).length
        : 0;
    },
  },
  methods: {
    setupSocket() {
      setupSocketListeners(
        this.handleNewNotification,
        this.handleConnect,
        this.handleDisconnect,
        this.handleError
      );
    },
    toggleNotificationsDropdown() {
      this.notificationsDropdownOpen = !this.notificationsDropdownOpen;
    },
    async fetchNotifications() {
      const response = await Vue.axios.get(
        `/noti/notifications/${this.$store.state.id}`
      );
      this.notifications = response.data;
    },
    async markNotificationAsRead(notificationId) {
      await Vue.axios.post(
        `/noti/mark-notifications-as-read/${notificationId}`
      );
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== notificationId
      );
    },
    handleNewNotification(data) {
      console.log("Received new notification:", data);
      const receivedNotification = data.notification && data.notification[0];

      if (receivedNotification) {
        console.log("Notification message:", receivedNotification.message);

        this.notifications.unshift(receivedNotification);

        if (!receivedNotification.read) {
          this.unreadNotificationsCount++;
        }
      } else {
        console.error("Invalid notification structure:", data);
      }
    },

    handleConnect() {
      console.log("Socket connected");
      this.fetchNotifications();
    },
    handleDisconnect() {
      console.log("Socket disconnected");
    },
    handleError(error) {
      console.error("Socket error:", error);
    },
    uploadAction() {
      this.$router.push({ path: "/upload" });
    },
    myVideo() {
      this.$router.push({ path: "/video" });
    },
    logout() {
      try {
        const token = localStorage.getItem("userToken");
        Vue.axios
          .post("/api/logout", {}, { headers: { Authorization: token } })
          .then(() => {
            localStorage.removeItem("userToken");
            this.$router.push({ path: "/login" });
          })
          .catch((error) => {
            console.error("Failed to logout:", error);
          });
      } catch (error) {
        console.error("An error occurred during logout:", error);
      }
    },
  },
  created() {
    this.setupSocket();
  },
};
</script>

<style>
div.logo {
  font-size: 18px;
}
.badge-custom {
  background-color: red;
  color: white;
  font-size: 12px;
}
</style>
