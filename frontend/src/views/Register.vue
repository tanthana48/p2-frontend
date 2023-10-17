<template>
    <v-main>
      <v-container fill-height>
        <v-row align="center" justify="center">
          <v-col
            xs="12"
            sm="8"
            md="6"
            lg="4"
          >
            <v-card class="pa-6" elevation="2">
              <v-container fluid>
  
                <v-row class="mb-4">
                  <v-col>
                    <h2 class="headline text-center">Create Account</h2>
                  </v-col>
                </v-row>
  
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
                      :rules="[confirmPasswordRules,passwordConfirmationRule]"
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
                      color="primary"
                      block
                      @click="register"
                    >
                      Register
                    </v-btn>
                  </v-col>
                </v-row>
                
                <v-row class="mt-4 text-center">
                  <v-col>
                    <span class="caption">Already have an account? <router-link to="/login">Login</router-link></span>
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
export default {
  data: () => ({
    valid: true,
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    emailRules: [
      (v) => !!v || 'Email is required',
      (v) => /.+@.+/.test(v) || 'Email must be valid'
    ],
    usernameRules: [(v) => !!v || 'Username is required'],
    passwordRules: [(v) => !!v || 'Password is required'],
    confirmPasswordRules: [
    function (v) { return !!v || 'Confirm Password is required'; },
    ]
  }),
  methods: {
    computed: {
    passwordConfirmationRule() {
        return () => (this.password === this.confirmPassword) || 'Password must match'
    },
    },
    async register() {
      // Registration logic here
    },
  },
};
</script>

<style scoped>
/* Additional styles if needed */
</style>





  