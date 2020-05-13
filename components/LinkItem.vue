<script>
export default {
  name: "link-item",
  props: ["title", "picture", "description", "link", "name", "classStyle"]
};
</script>
<template>
  <b-link :href="link" class="post-link-share">
    <div v-if="picture" class="post-link-share--picture">
      <b-img :src="picture"></b-img>
    </div>
    <div class="post-link-share--detail border-top pt-2 pb-3">
      <!-- <h6 class="text-dark">{{description}}</h6> -->
      <h6 class="text-dark mb-1">{{title}}</h6>
      <span class="text-muted small">{{name}}</span>
    </div>
  </b-link>
</template>