<script>
import RoundeAvatar from "./RoundeAvatar";
export default {
  name: "group-item",
  components: {
    RoundeAvatar
  },
  props: {
    background: Object,
    name: String,
    href: String,
    members: Object,
    join: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<template>
  <div class="group-item">
    <div class="group-item-wrapper d-flex">
      <div class="group-item-icon">
        <fa-icon :icon="['fas','users']" class="fa-2x text-dark" />
        <!-- <rounde-avatar
          v-bind:source="background"
          defaultSource="https://img.icons8.com/cotton/64/000000/business-group.png"
          setSize="36"
        />-->
      </div>
      <div class="group-information ml-2">
        <h6 class="group-name">
          <nuxt-link :to="href">{{name}}</nuxt-link>
        </h6>
        <!-- <p class="group-member">{{members.count}} thành viên</p> -->
        <b-button v-if="join" class="btn-join-group" variant="primary" size="sm">
          <i class="fas fa-plus"></i> Join group
        </b-button>
      </div>
    </div>
  </div>
</template>
<style>
/* https://media.istockphoto.com/vectors/vector-illustration-flat-style-businessmen-discuss-social-network-of-vector-id1062169958?k=6&m=1062169958&s=612x612&w=0&h=oG8MeXyINTtGAReZBsrxANYXHXRcXuBe9W9XTrDHVPI= */
.group-information {
  flex-grow: 1;
}
.group-information .group-name {
  margin-bottom: 0;
}
.group-information .group-member {
  margin-bottom: 0.05rem;
}
.group-information .btn-join-group {
  /* width: 100%; */
  font-size: 12px;
  font-weight: bold;
  padding-top: 0;
  padding-bottom: 0;
}
.group-item {
  padding: 0.25rem 0.5rem;
  background: #f7f7f7;
  border-radius: 4px;
}
</style>