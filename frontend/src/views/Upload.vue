<template>
  <div>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="pa-4" outlined>
            <v-card-title class="text-center">
              Upload Video
            </v-card-title>

            <v-text-field
              label="Title"
              v-model="videoTitle"
            ></v-text-field>

            <v-textarea
              label="Description"
              v-model="videoDescription"
              rows="5"
              auto-grow
            ></v-textarea>

            <div class="mb-2">
              <v-btn @click="triggerFileInput" color="#212121" class="white--text">Choose video</v-btn>
              <input type="file" ref="videoInput" @change="handleVideoSelect" style="display: none;" />
              <div v-if="videoFile">{{ videoFile.name }}</div>
            </div>

            <v-progress-linear
              v-if="isLoading"
              indeterminate
              color="primary"
            ></v-progress-linear>

            <v-row class="mt-3">
              <v-col cols="12" md="6">
                <v-btn 
                  @click="uploadVideo" 
                  block 
                  color="primary" 
                  :disabled="isUploading">
                  Upload
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn @click="cancelUpload" block color="error">Cancel</v-btn>
              </v-col>
            </v-row>


            <!-- Upload Status Message -->
            <v-alert v-if="uploadStatus" :type="statusType" class="mt-3">
              {{ uploadStatus }}
            </v-alert>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<script>
import Vue from "vue";
export default {
  data() {
    return {
      videoFile: null,
      videoTitle: '',
      videoDescription: '',
      uploadStatus: '',
      statusType: '',
      isLoading: false,
      progress: 0,
      isUploading: false
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.videoInput.click();
    },
    handleVideoSelect(event) {
      this.videoFile = event.target.files[0];
    },
    cancelUpload() {
      this.$router.push({ path: "/" });
    },
    async uploadVideo() {
      if (!this.videoFile) {
        this.uploadStatus = 'Please select a video to upload.';
        this.statusType = 'error';
        return;
      }

      this.isLoading = true;
      this.isUploading = true;

      let formData = new FormData();
      formData.append('video', this.videoFile);
      formData.append('title', this.videoTitle);
      formData.append('description', this.videoDescription);
      formData.append('username', this.$store.state.username);

      try {
        let response = await Vue.axios.post('/api/upload', formData);
        this.uploadStatus = 'Video uploaded successfully! Pre-signed URL: ' + response.data.presigned_url;
        this.statusType = 'success';
      } catch (error) {
        this.uploadStatus = 'Error: ' + (error.response && error.response.data.error ? error.response.data.error : error.message);
        this.statusType = 'error';
      } finally {
        this.isLoading = false;
        this.isUploading = false;
      }
    }
  }
};
</script>
