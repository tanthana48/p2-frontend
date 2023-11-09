import Vue from "vue";
import VueRouter from "vue-router";
import Layout from "../views/Layout";
import store from "@/store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Layout",
    component: Layout,
    children: [
      {
        path: "",
        name: "Home",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "../views/Home.vue"),
      },
      {
        path: "upload",
        name: "Upload",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "about" */ "../views/Upload.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Register.vue"),
  },
  {
    path: "/video",
    name: "MyVideo",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/MyVideo.vue"),
  },
];

const router = new VueRouter({
  routes,
});

//Setup beforeEach hook to check the logged in sync the loggin states with backend
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("userToken");

  if (token) {
    Vue.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  const checkTokenValidity = async () => {
    try {
      let response = await Vue.axios.get("/api/whoami");
      await store.dispatch("setLoggedInUser", response.data);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("userToken");
        next({ name: "Login" });
      }
    }
  };

  // If the user is navigating to Login or Register page
  if (to.name === "Login" || to.name === "Register") {
    if (token && (await checkTokenValidity())) {
      next({ name: "Home" });
    } else {
      next();
    }
  }
  // For all other routes
  else {
    if (!token || !(await checkTokenValidity())) {
      next({ name: "Login" });
    } else {
      next();
    }
  }
});

export default router;
