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

          <v-icon left small class="mr-2" @click.stop="toggleLike(video)">
            {{ video.isLikedByCurrentUser ? "mdi-heart" : "mdi-heart-outline" }}
          </v-icon>
          {{ video.likes }} likes
        </v-card-actions>
      </v-card>
    </div>
    <div v-if="showPlayer && selectedVideo">
      <div v-for="comment in selectedVideoComments" :key="comment.id">
        <v-card>
          <v-card-text>{{ comment.text }}</v-card-text>
        </v-card>
      </div>

      <v-textarea v-model="newCommentText" label="Add a comment"></v-textarea>
      <v-btn @click="postComment(selectedVideo.id)">Post Comment</v-btn>
    </div>
  </v-container>
</template>

<script>
import Vue from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: "VideoList",
  data() {
    return {
      videos: [],
      selectedVideo: null,
      player: null,
      showPlayer: false,
      selectedVideoComments: [],
      newCommentText: "",
    };
  },
  mounted() {
    this.fetchVideos();
    this.startPolling();
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
  methods: {
    startPolling() {
      setInterval(() => {
        this.fetchVideos();
        if (this.selectedVideo) {
          this.fetchComments(this.selectedVideo.id);
        }

      }, 10000);
    },
    async fetchVideos() {
      try {
        const response = await Vue.axios.get("/api/videos");
        const videosWithURLs = await Promise.all(
          response.data.videos.map(async (video) => {
            video.presignedThumbnailURL = await this.generateThumbnailURL(
              video.thumbnail_filename
            );
            video.isLikedByCurrentUser = await this.checkIfUserLikedVideo(
              video.id
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
        const response = await Vue.axios.post("/api/increment-views", {
          video_id: videoId,
        });
        if (response.data.success) {
          const video = this.videos.find((v) => v.id === videoId);
          if (video) {
            video.views = response.data.views;
          }
        }
      } catch (error) {
        console.error("Error incrementing views:", error);
      }
    },
    async checkIfUserLikedVideo(videoId) {
      try {
        const response = await Vue.axios.get(
          `/api/check-like/${videoId}/${this.$store.state.username}`
        );
        return response.data.isLiked;
      } catch (error) {
        console.error("Error checking if user liked video:", error);
        return false;
      }
    },
    async toggleLike(video) {
      const originalLikes = video.likes;
      const originalLikeStatus = video.isLikedByCurrentUser;

      video.isLikedByCurrentUser = !video.isLikedByCurrentUser;
      video.likes += video.isLikedByCurrentUser ? 1 : -1;

      try {
        if (originalLikeStatus) {
          video.likes = await this.decrementLikes(video.id);
        } else {
          video.likes = await this.incrementLikes(video.id);
        }
      } catch (error) {
        console.error("Error updating like status:", error);
        video.isLikedByCurrentUser = originalLikeStatus;
        video.likes = originalLikes;
      }
     
    },
    async incrementLikes(videoId) {
      try {
        const response = await Vue.axios.post(
          `/api/increment-likes/${this.$store.state.username}`,
          {
            video_id: videoId,
          }
        );
        if (response.data.success) {
          const video = this.videos.find((v) => v.id === videoId);
          if (video) {
            video.likes=response.data.likes;
          }
        }
      } catch (error) {
        console.error("Error incrementing likes:", error);
      }
    },
    async decrementLikes(videoId) {
      try {
        const response = await Vue.axios.post(
          `/api/decrement-likes/${this.$store.state.username}`,
          {
            video_id: videoId,
          }
        );
        if (response.data.success) {
          const video = this.videos.find((v) => v.id === videoId);
          if (video) {
            video.likes= response.data.likes;
          }
        }
      } catch (error) {
        console.error("Error decrementing likes:", error);
      }
    },
    async fetchComments(videoId) {
      try {
        const response = await Vue.axios.get(`/api/comments/${videoId}`);
        this.selectedVideoComments = response.data;
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    },
    async postComment(videoId) {
      try {
        const response = await Vue.axios.post(
          `/api/post-comment/${this.$store.state.username}`,
          {
            video_id: videoId,
            text: this.newCommentText,
          }
        );

        if (response.data.success) {
          this.selectedVideoComments.push({
            text: this.newCommentText,
          });
          this.newCommentText = "";
          this.fetchComments(videoId);
        }
      } catch (error) {
        console.error("Error posting comment:", error);
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
        this.selectedVideo = this.videos.find((v) => v.id === videoId);
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
        await this.fetchComments(videoId);
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
