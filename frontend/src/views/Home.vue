<template>
  <v-container class="text-center">
    <div class="my-5" v-if="showPlayer">
      <video
        ref="videoPlayer"
        class="video-js vjs-default-skin mx-auto"
        controls
        preload="auto"
        width="640"
        height="360"
      ></video>
    </div>

    <div
      class="my-3"
      v-for="video in videos"
      :key="video.id"
      @click="loadVideo(video.hls_filename, video.id)"
    >
      <img :src="video.presignedThumbnailURL" width="480" height="270" />

      <v-card class="mx-auto my-3" max-width="500">
        <v-card-title>
          <span class="headline">{{ video.title }}</span>
        </v-card-title>

        <v-card-subtitle>
          {{ video.description }}
        </v-card-subtitle>

        <v-card-actions>
          <v-icon left small class="mr-2">mdi-eye</v-icon>
          {{ video.views }} views
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import Vue from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import socket, { emitEvent, setupSocketListeners } from "@/services/socket.js";

export default {
  name: "VideoList",
  data() {
    return {
      videos: [],
      selectedVideo: null,
      player: null,
      showPlayer: false,
    };
  },
  mounted() {
    this.fetchVideos();
    this.setupSocket();
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
  methods: {
    setupSocket() {
      setupSocketListeners(
        this.handleMessage,
        this.handleConnect,
        this.handleDisconnect,
        this.handleError
      );
    },
    handleMessage(message) {
      if (message.type === "viewCountUpdated") {
        const video = this.videos.find((v) => v.id === message.videoId);
        if (video) {
          video.views = message.viewCount;
        }
      }
    },

    handleConnect() {
      console.log("Socket connected");
    },

    handleDisconnect() {
      console.log("Socket disconnected");
    },

    handleError(error) {
      console.error("Socket error:", error);
    },
    async fetchVideos() {
      try {
        const response = await Vue.axios.get("/api/videos");
        const videosWithURLs = await Promise.all(
          response.data.videos.map(async (video) => {
            video.presignedThumbnailURL = await this.generateThumbnailURL(
              video.thumbnail_filename
            );
            return video;
          })
        );
        this.videos = videosWithURLs;
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    },
    async incrementViews(videoId) {
      try {
        await Vue.axios.post("/api/increment-views", { video_id: videoId });
      } catch (error) {
        console.error("Error incrementing views:", error);
      }
    },
    async generateThumbnailURL(filename) {
      try {
        const response = await Vue.axios.post(
          "/api/get-presigned-url-thumbnail",
          { thumbnail_filename: filename }
        );
        return response.data.presigned_url;
      } catch (error) {
        console.error("Error generating thumbnail URL:", error);
      }
    },
    async loadVideo(hlsFilename, videoId) {
      try {
        this.showPlayer = true;
        const response = await Vue.axios.post("/api/get-presigned-m3u8", {
          hls_filename: hlsFilename,
        });
        const m3u8Content = response.data.m3u8_content;

        const blob = new Blob([m3u8Content], {
          type: "application/vnd.apple.mpegurl",
        });
        const url = URL.createObjectURL(blob);

        if (!this.player) {
          this.initializePlayer(url);
        } else {
          this.player.src({ type: "application/x-mpegURL", src: url });
          this.player.load();
          this.player.play();
        }
        await this.incrementViews(videoId);
        emitEvent("update-view-count", videoId);
      } catch (error) {
        console.error("Error fetching the m3u8 content:", error);
      }
    },
    initializePlayer(url) {
      this.player = videojs(this.$refs.videoPlayer, {
        sources: [
          {
            src: url,
            type: "application/x-mpegURL",
          },
        ],
      });

      this.player.play();
    },
  },
};
</script>
