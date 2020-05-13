<script>
import NotificationItem from "@/components/NotificationItem";
import _ from "lodash";
import client from "@/services/client";
import { ContentLoader } from "vue-content-loader";
export default {
  name: "notification-list",
  components: { NotificationItem, ContentLoader },
  // async asyncData({ $auth }) {
  //   console.log("assssssssssssssssss");

  //   try {
  //     const { data, status } = await client.notification("get", {
  //       params_filter: {
  //         user: $auth.user.id
  //       }
  //     });
  //     console.log(data);
  //     return {
  //       notification: {
  //         next: data.next,
  //         results: data.results
  //       }
  //     };
  //   } catch (err) {
  //     return {
  //       notification: {
  //         next: "",
  //         results: []
  //       }
  //     };
  //   }
  // },
  data: () => ({
    notification: {
      next: "",
      results: []
    },
    isLoading: true
  }),
  created() {
    this.getListNotification();
  },
  methods: {
    async getListNotification() {
      this.isLoading = true;
      try {
        const { data, status } = await client.notification("get", {
          params_filter: {
            user: this.$auth.user.id
          }
        });
        this.notification = {
          next: data.next,
          results: data.results
        };
      } catch (err) {
        console.log(err);
      }
      this.isLoading = false;
    }
  }
};
</script>
<template>
  <div class="list-notification-wrapper w-100">
    <div class="list-notification-header">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          Thông báo
          <fa-icon :icon="['far','bell']" />
        </h6>
        <b-dropdown
          variant="link"
          right
          toggle-class="text-decoration-none btn-link text-muted"
          no-caret
        >
          <template v-slot:button-content>
            <i class="fas fa-ellipsis-h"></i>
          </template>
          <b-dropdown-item href="#">Sao chép liên kết</b-dropdown-item>
          <b-dropdown-item href="#">Report</b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
    <ul class="list-notification overflow-auto">
      <li class="notification-item-wrapper" v-for="(item,i) in notification.results" :key="i">
        <notification-item :instance="item"></notification-item>
      </li>
      <client-only>
        <content-loader v-show="isLoading" :speed="3" class="w-100">
          <rect x="0" y="0" rx="3" ry="3" width="400" height="50" />
        </content-loader>
      </client-only>
    </ul>
  </div>
</template>
<style lang="scss">
$border: 1px solid rgba(0, 0, 0, 0.2);

.list-notification-wrapper {
  .list-notification-header {
    padding: 0 0.5rem;
  }
  .list-notification {
    list-style-type: none;
    margin: 0;
    padding: 0;
    &:first-child {
      border-top: $border;
    }
  }
  .notification-item-wrapper {
    // border-bottom: $border;
    margin-bottom: 1px;
  }
}
</style>