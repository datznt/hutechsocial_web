<script>
import CricleAvatar from "./CricleAvatar";
export default {
  name: "user-item",
  components: {
    CricleAvatar
  },
  props: {
    avatar: Object,
    username: String,
    text: String,
    href: String,
    follow: {
      type: Boolean,
      default: false
    },
    isSelected: Boolean
  },
  methods: {
    handleClick() {
      this.$emit("click");
    }
  }
};
</script>
<template>
  <div
    @click="handleClick"
    :class="['mb-1 d-flex justify-content-between align-items-center user-item',{'user-item--selected' : isSelected}]"
  >
    <div class="clear d-flex user-item-wrapper">
      <cricle-avatar
        v-bind:source="avatar"
        defaultSource="/images/avatar-anonymous.png"
        setSize="36"
      />
      <div class="ml-2 user-information">
        <h6 class="user-name">
          <nuxt-link :to="href">{{username}}</nuxt-link>
        </h6>
        <div>
          <slot name="bottom"></slot>
        </div>
      </div>
    </div>
    <div class="user-item-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<style>
.user-information {
  flex-grow: 1;
}
.user-follow {
  width: 5rem;
}
.user-information {
  flex-grow: 1;
}
.user-information .user-name {
  margin-bottom: 0;
}
.user-information .user-text {
  margin-bottom: 0.05rem;
}
.user-information .btn-user-follow {
  /* width: 100%; */
  font-size: 12px;
  font-weight: bold;
  padding-top: 0;
  padding-bottom: 0;
}
.user-item {
  padding: 0.25rem 0.5rem;
  background: #f7f7f7;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: 300ms;
  cursor: pointer;
}
.user-item:hover,
.user-item--selected {
  background: #28a74526;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>