<script>
import Navbar from "@/components/Navbar";
import NotificationList from "@/components/NotificationList";
import CricleAvatar from "@/components/CricleAvatar";
import client from "@/services/client";
import { mapGetters, mapState } from "vuex";

export default {
  components: {
    "nav-bar": Navbar,
    CricleAvatar,
    NotificationList
  },
  data() {
    return {
      followReport: {
        following: 0,
        followers: 0
      },
      offset: { top: 80, bottom: 80 }
    };
  },
  computed: {
    ...mapGetters({
      loggedInUser: "loggedInUser"
    }),
    ...mapState({
      loggedIn: state => state.auth.loggedIn,
      socketMessage: state => state.socket.message,
      socketState: state => state.socket.isConnected
    })
  },
  watch: {
    loggedIn(newValue, oldValue) {
      if (!newValue) {
        this.disconnectSocket();
      }
    },
    socketMessage(msg) {
      if (!_.has(msg, "type") || !_.has(msg, "payload")) {
        return;
      }
      switch (msg.type) {
        case "notification":
          if (_.has(msg, "payload.callback")) {
            this.showNotification(msg.payload.callback);
          }
          break;
      }
    },
    socketState(connected) {
      this.objectHook(connected);
    }
  },
  mounted() {
    if (this.loggedIn) {
      this.connectSocket();
    }
  },
  methods: {
    connectSocket() {
      const _url = "ws://127.0.0.1:8000/";
      this.$connect(_url);
    },
    disconnectSocket() {
      this.$disconnect();
    },
    objectHook(toogle) {
      if (!this.loggedIn) return;
      client.socket(toogle ? "login" : "logout", {
        socket_instance: this.$socket,
        object_type: "user",
        object_id: this.$auth.user.id,
        authorization_token: this.$auth.getToken("local")
      });
    },
    async showNotification(notification_id) {
      try {
        const { data } = await client.notification("retrieve", {
          notification_id: notification_id
        });
        if (_.has(data, "payload.title") && _.has(data, "payload.content")) {
          this.$bvToast.toast(data.payload.content, {
            title: data.payload.title,
            href: data.payload.launch_url,
            toaster: "b-toaster-bottom-left"
          });
        }
      } catch (error) {
        console.log(error.response);
      }
    }
  }
};
</script>

<template>
  <div class="wrapper">
    <nav-bar />
    <b-container class="page" fluid="xl">
      <b-row>
        <b-col md="3" v-if="loggedIn">
          <div class="group-cards-wrapper">
            <div class="sticky">
              <b-card no-body class="gedf-card card-profile-user">
                <b-card-body>
                  <div class="d-flex justify-content-between align-items-start flex-wrap">
                    <div class="item pr-2 align-self-start">
                      <cricle-avatar
                        v-bind:source="loggedInUser.avatar"
                        defaultSource="/images/avatar-anonymous.png"
                        setSize="50"
                        :showIcon="true"
                      >
                        <span v-if="$nuxt.isOnline">
                          <i class="fas fa-circle text-success"></i>
                        </span>
                        <span v-else>
                          <i class="fas fa-circle text-dange"></i>
                        </span>
                      </cricle-avatar>
                    </div>
                    <div class="item flex-fill">
                      <div class="h5">{{loggedInUser.full_name}}</div>
                      <nuxt-link
                        :to="$router.resolve({
                        name : 'users-slug',
                        params: {'slug' : loggedInUser.slug}
                      }).href"
                        class="btn btn-primary btn-sm"
                      >Trang cá nhân</nuxt-link>
                    </div>
                  </div>
                </b-card-body>
              </b-card>
              <b-card no-body class="gedf-card">
                <div class="mt-2 mb-2">
                  <notification-list />
                </div>
              </b-card>
            </div>
          </div>
        </b-col>
        <b-col :md="loggedIn ? 9 : 12">
          <!-- <b-col md="12"> -->
          <nuxt />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style>
.group-cards-wrapper {
  height: 100%;
}
.group-cards-wrapper .sticky {
  position: sticky;
  top: 80px;
}
.wrapper {
  padding-top: 5rem;
}
</style>