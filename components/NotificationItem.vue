<script>
import _ from "lodash";
export default {
  name: "notification-item",
  props: {
    styleClass: {
      type: String,
      default: null
    },
    instance: {
      type: Object,
      default: null
    }
  },
  computed: {
    reverseTitle() {
      return _.get(this.instance, "payload.title_html");
    },
    reverseStyleClass() {
      if (this.styleClass) {
        return this.styleClass;
      }
      // if (_.get(this.instance, "is_read") == false) {
      //   return "notification-item--active";
      // }
      return null;
    },
    reverseCreateTime() {
      const v = _.get(this.instance, "notification.create_at");
      return v;
    },
    reverseIcon() {
      return _.get(this.instance, "payload.icon");
    },
    reversePicture() {
      return _.get(this.instance, "payload.image");
    },
    reverseLaunchUrl() {
      var launch = _.get(this.instance, "payload.launch_url");
      if (!launch) {
        return null;
      }
      launch = launch.replace(window.location.origin, "");
      return launch;
    }
  },
  created() {
    console.log(this.instance);
  }
};
</script>
<template>
  <nuxt-link
    v-if="instance"
    :to="reverseLaunchUrl"
    :class="['notification-item d-flex justify-content-start text-decoration-none',reverseStyleClass]"
  >
    <div v-if="reverseIcon" class="notification-item-icon">
      <b-avatar size="2rem" :src="reverseIcon" variant="info"></b-avatar>
    </div>
    <div class="notification-item-content ml-2">
      <div class="notification-item-content-detail text-dark">
        <span v-html="reverseTitle"></span>
      </div>
      <div class="notification-item-content-timestamp">
        <small>
          &#8212;
          <timeago :datetime="reverseCreateTime" :auto-update="60"></timeago>
        </small>
      </div>
      <div v-if="reversePicture" class="notification-item-content-picture">
        <b-img :src="reversePicture" fluid></b-img>
      </div>
    </div>
  </nuxt-link>
</template>
<style lang="scss">
.notification-item {
  padding: 0.2rem 0.2rem 0.2rem 0.5rem;
  transition: 500ms;
  &:hover,
  &--active {
    background: #28a74526;
  }
  .notification-item-content-detail * {
    margin-bottom: 0;
  }
}
</style>