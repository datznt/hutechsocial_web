<script>
import client from "@/services/client";
import {
  fullBrowserVersion,
  osVersion,
  browserName
} from "mobile-device-detect";
export default {
  name: "login",
  head: {
    title: "Login"
  },
  layout: "auth",
  data() {
    return {
      loginInfo: {
        username: "",
        password: ""
      },
      badRequest: false
    };
  },
  created() {
    // console.log(fullBrowserVersion, osVersion, browserName);
  },
  methods: {
    async login() {
      try {
        const resp = await this.$auth.loginWith("local", {
          data: this.loginInfo
        });
        if (resp.status == 200 && _.has(resp.data, "key")) {
          await this.registrationDevice(resp.data.user.id);
        }
      } catch (e) {
        this.badRequest = !this.badRequest;
      }
    },
    async registrationDevice(userId) {
      const notificationId = await this.$OneSignal.getUserId();
      if (!notificationId) return;
      const resp = await client.device("registration", {
        device_name: browserName,
        player_id: notificationId,
        user_id: userId
      });
    }
  }
};
</script>
<template>
  <b-card no-body class="border-0 shadow-sm" style="max-width:20rem"> 
    <b-card-body>
      <h3>Đăng nhập vào tài khoản của bạn</h3>
      <b-form @submit.prevent="login">
        <transition name="fade">
          <b-alert
            :show="badRequest"
            variant="danger"
          >You have entered an invalid username or password</b-alert>
        </transition>
        <b-form-group
          id="input-group-1"
          label-for="input-1"
          
        >
          <b-form-input
            id="input-1"
            type="text"
            required
            autofocus
            v-model="loginInfo.username"
            placeholder="Enter email or username"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-2" label-for="input-2">
          <b-form-input
            id="input-2"
            required
            v-model="loginInfo.password"
            type="password"
            placeholder="Enter password"
          ></b-form-input>
        </b-form-group>
        <b-link href="#" class="float-right">Forgot Password?</b-link>
        <b-button class="mt-2" type="submit" variant="primary">Đăng nhập</b-button>
      </b-form>
      <div class="signup-area text-center mt-3">
        <p>
          Don't have an account?
          <b-link href="#">Sign up</b-link>
        </p>
        <div class="d-flex">
          <hr class="my-auto flex-grow-1" />
          <small class="px-4 text-muted">or connect using</small>
          <hr class="my-auto flex-grow-1" />
        </div>
        <div class="d-flex justify-content-between mt-2">
          <b-button class="btn-facebook w-100 mr-2" size="sm">
            <i class="fab fa-facebook-f"></i>
          </b-button>
          <b-button class="btn-google primary w-100 mr-2" size="sm">
            <i class="fab fa-google"></i>
          </b-button>
          <b-button class="btn-linkedin primary w-100" size="sm">
            <i class="fab fa-linkedin-in"></i>
          </b-button>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>