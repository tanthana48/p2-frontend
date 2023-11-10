<template>
  <v-app>
    <v-app-bar app color="#2C2C2C">
      <v-spacer></v-spacer>
      <span class="mr-4 white--text">
        <v-icon class="white--text"> mdi mdi-account </v-icon>
        {{ $store.state.username }}</span
      >

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

export default {
  methods: {
    async uploadAction() {
      await this.$router.push({ path: "/upload" });
    },
    async myVideo() {
      await this.$router.push({ path: "/video" });
    },
    async logout() {
      try {
        const token = localStorage.getItem("userToken");
        let response = await Vue.axios.post(
          "/api/logout",
          {},
          {
            headers: {
              Authorization: token,
            },
          }
        );
        localStorage.removeItem("userToken");
        if (response.data.message === "Logged out successfully") {
          await this.$router.push({ path: "/login" });
        } else {
          console.error(
            "Failed to logout:",
            response.data.error || "Unknown error"
          );
        }
      } catch (error) {
        console.error("An error occurred during logout:", error);
      }
    },
  },
};
</script>

<style>
div.logo {
  font-size: 18px;
}
</style>
