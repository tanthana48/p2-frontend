import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import router from "@/router";

Vue.use(VueAxios, axios);

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is expired
      localStorage.removeItem("userToken");
      router.push({ path: "/login" });
    }
    return Promise.reject(error);
  },
);
