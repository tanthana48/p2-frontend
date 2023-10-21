<template>
  <v-main>
    <v-container fill-height>
      <v-row align="center" justify="center">
        <v-col xs="12" sm="8" md="6" lg="4">
          <v-card class="pa-6" elevation="2">
            <v-container fluid>
              <v-row class="mb-4">
                <v-col>
                  <h2 class="headline text-center">Create Account</h2>
                </v-col>
              </v-row>

              <v-form ref="form">
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="username"
                      label="Username"
                      :rules="usernameRules"
                      required
                      solo
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="email"
                      label="Email"
                      :rules="emailRules"
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
                      label="Password"
                      :rules="passwordRules"
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
                      v-model="confirmPassword"
                      label="Confirm Password"
                      :rules="[...confirmPasswordRules, passwordConfirmationRule]"
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
                      @click="register()"
                      class="white--text"
                    >
                      Register
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>

              <v-row class="mt-4 text-center">
                <v-col>
                  <span class="text-subtitle-2">
                    Already have an account?
                    <router-link class="red--text" to="/login">Login</router-link>
                  </span>
                </v-col>
              </v-row>
            </v-container>
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
    valid: true,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    emailRules: [
      (v) => !!v || "Email is required",
      (v) => /.+@.+/.test(v) || "Email must be valid",
    ],
    usernameRules: [(v) => !!v || "Username is required"],
    passwordRules: [(v) => !!v || "Password is required"],
    confirmPasswordRules: [
      (v) => !!v || "Confirm Password is required",
    ],
  }),

  computed: {
    passwordConfirmationRule() {
      return (v) => v === this.password || "Password must match";
    },
  },

  methods: {
    async register() {
      if (this.$refs.form.validate()) {
          const userData = {
              username: this.username,
              email: this.email,
              password: this.password,
          };

          try {
              let response = await Vue.axios.post("/api/register", userData, {
                  headers: {
                      "Content-Type": "application/json",
                  },
              });

              // Check if response contains a token
              if (response.data && response.data.token) {
                  localStorage.setItem("userToken", response.data.token);
                  this.alertSuccess("Registration successful!");
                  this.$router.push({ path: "/" });
              } else if (response.data && response.data.error) {
                  // Check for specific error messages
                  if (response.data.error === "Username is already taken") {
                      this.alertError("Username is already taken. Please choose another one.");
                  } else {
                      this.alertError("Registration failed. " + response.data.error);
                  }
              } else {
                  this.alertError("Registration failed. No token received.");
              }
          } catch (error) {
              console.error("An error occurred during registration:", error);
              this.alertError("Registration failed due to an error.");
          }
      }
  },


    alertError(message) {
      alert(message);
    },

    alertSuccess(message) {
      alert(message);
    },
  },
};

</script>
