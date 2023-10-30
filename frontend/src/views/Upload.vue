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
    generateUniqueFilename(username, originalFilename) {
      const timestamp = Date.now();
      const fileExtension = originalFilename.split('.').pop(); // get the file extension
      return `${username}_${timestamp}.${fileExtension}`;
    },
    checkVideoDuration(file) {
      return new Promise((resolve, reject) => {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        
        videoElement.onloadedmetadata = function() {
          window.URL.revokeObjectURL(videoElement.src);
          const duration = videoElement.duration;
          if (duration > 60) {
            reject('Video is too long (max: 1 minute)');
          } else {
            resolve();
          }
        };
        
        videoElement.onerror = function() {
          reject('Error loading video file');
        };
        
        videoElement.src = URL.createObjectURL(file);
      });
    },
    async getPresignedUrl(newFileName) {
      // Request the backend for a pre-signed URL
      const response = await Vue.axios.post('/api/get-presigned-url', {
        fileName: newFileName,
        fileType: this.videoFile.type,
        title: this.videoTitle,
        description: this.videoDescription,
        username: this.$store.state.username
      });
      return response.data.presigned_url;
    },
    async uploadVideo() {
      if (!this.videoFile) {
        this.uploadStatus = 'Please select a video to upload.';
        this.statusType = 'error';
        return;
      }

      this.isLoading = true;
      this.isUploading = true;

      try {
      await this.checkVideoDuration(this.videoFile);
      const uniqueFilename = this.generateUniqueFilename(this.$store.state.username, this.videoFile.name);
      const presignedUrl = await this.getPresignedUrl(uniqueFilename);
      console.log(`Uploading video with Content-Type: ${this.videoFile.type}`);

      await Vue.axios.put(presignedUrl, this.videoFile, {
        headers: {
          'Content-Type': this.videoFile.type
        }
      });
      
      const status = await Vue.axios.post('/api/confirm-upload', {
        s3_filename: uniqueFilename,
        title: this.videoTitle,
        description: this.videoDescription,
        username: this.$store.state.username
      });
        this.uploadStatus = status;
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
