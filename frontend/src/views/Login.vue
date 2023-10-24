<template>
  <v-main>
    <v-container fill-height>
      <v-row align="center" justify="center">
        <v-col xs="12" sm="8" md="6" lg="4">
          <v-card class="pa-6" elevation="2">
            <v-form ref="form">
              <v-container fluid>
                <v-row class="mb-4">
                  <v-col>
                    <h2 class="headline font-weight-black text-center text-uppercase">Login</h2>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="username"
                      :rules="usernameRules"
                      label="Username"
                      required
                      solo
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      type="password"
                      v-model="password"
                      :rules="passwordRules"
                      label="Password"
                      required
                      solo
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row class="mt-4">
                  <v-col>
                    <v-btn
                      :disabled="!valid"
                      color="#212121"
                      block
                      @click="submit"
                      class="white--text"
                    >
                      Login
                    </v-btn>
                  </v-col>
                </v-row>

                <v-row class="mt-5 text-center">
                  <v-col>
                    <span class="text-subtitle-2
">
                    Don't have an account?
                    <router-link class="red--text" to="/register">Signup</router-link>
                  </span>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
<script>
import Vue from "vue";

export default {
  data: () => ({
    username: "",
    password: "",
    usernameRules: [(v) => !!v || "Username is required"],
    passwordRules: [(v) => !!v || "Password is required"],
  }),
  computed: {
    valid() {
      return this.usernameRules.every((rule) => rule(this.username)) && 
            this.passwordRules.every((rule) => rule(this.password));
    }
  },
  methods: {
    async register() {
      console.log('Register button clicked');
      await this.$router.push({ path: "/register" });
    },
    async submit() {
      if (this.$refs.form.validate()) {
        // submit to backend to authenticate
        let loginData = {
          username: this.username,
          password: this.password,
        };

        try {
          let response = await Vue.axios.post("/api/login", loginData);
          if (response.data.token) {
            localStorage.setItem("userToken", response.data.token);
            await this.$router.push({ path: "/" });
          } else if (response.data.error) {
            console.error(`Server error: ${response.data.error}`);
            alert(response.data.error);
          }
        } catch (error) {
          console.error(`Network or server error: ${error}`);
          alert(
            "There was an issue connecting to the server. Please try again later."
          );
        }
      }
    },
    reset() {
      this.$refs.form.reset();
    },
  },
};
</script>
