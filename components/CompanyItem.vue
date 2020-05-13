<script>
import CricleAvatar from "./CricleAvatar";
export default {
  name: "company-item",
  components: {
    CricleAvatar
  },
  props: {
    logo: Object,
    name: String,
    industry: Object,
    href: String,
    follow: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<template>
  <div class="d-flex">
    <cricle-avatar v-bind:source="logo" defaultSource="/images/avatar-anonymous.png" setSize="46" />
    <div class="company-information ml-2">
      <h5>{{name}}</h5>
      <p class="text-muted" v-if="industry">{{industry.name}}</p>
    </div>
    <div class="company-follow">
      <b-button variant="outline-info">Follow</b-button>
    </div>
  </div>
</template>
<style>
.company-information {
  flex-grow: 1;
}
.company-follow {
  width: 5rem;
}
</style>