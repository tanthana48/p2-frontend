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
                  <h2 class="headline text-center">Login Account</h2>
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
                    color="primary"
                    block
                    @click="submit"
                  >
                    Login
                  </v-btn>
                </v-col>
              </v-row>

              <v-row class="mt-4 text-center">
                <v-col>
                  <v-btn text color="blue-grey lighten-1" @click="register">Register</v-btn>
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
//import Vue from 'vue'

export default {
  data: () => ({
    valid: true,
    username: 'admin',
    password: '123456',
    usernameRules: [(v) => !!v || 'Username is required'],
    passwordRules: [(v) => !!v || 'Password is required']
  }),

  methods: {
    //
    async register() {

      await this.$router.push({ path: '/register'})
      
    },
    async submit() {
      // Mock response
      let response = {
        data: {
          success: true
        }
      }

      if (response.data.success) {
        await this.$router.push({ path: '/' })
      }
    },

    reset() {
      this.$refs.form.reset()
    }
  }
}
</script>
