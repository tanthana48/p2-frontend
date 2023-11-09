<template>
  <v-container>
    <h1>My Videos</h1>
    <v-alert v-if="error" type="error" dismissible>{{ error }}</v-alert>

    <v-data-table
      :headers="headers"
      :items="videos"
      class="elevation-1"
      :loading="loading"
      no-data-text="No videos found"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn color="red" icon @click="deleteVideo(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import Vue from "vue";
export default {
  data() {
    return {
      videos: [],
      loading: false,
      error: null,
      headers: [
        { text: "ID", value: "id" },
        { text: "Title", value: "title" },
        { text: "Description", value: "description" },
        { text: "Date", value: "date" },
        { text: "Views", value: "views" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  created() {
    this.fetchVideos();
  },
  methods: {
    async fetchVideos() {
      this.loading = true;
      try {
        const response = await Vue.axios.post("/api/myvideos", {
          username: this.$store.state.username,
        });
        this.videos = response.data.videos;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async deleteVideo(videoId) {
      try {
        await this.$http.delete(`/api/videos/${videoId}`);
        this.fetchVideos();
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>
