<script>
import NewsFeed from "@/components/NewsFeed";
import CricleAvatar from "@/components/CricleAvatar";
import client from "@/services/client";
import GroupMenuManager from "@/components/GroupMenuManager";
import { InstagramLoader } from "vue-content-loader";
export default {
  scrollToTop: true,
  components: {
    NewsFeed,
    CricleAvatar,
    GroupMenuManager,
    InstagramLoader,
  },
  head: {
    title: "Aj"
  },
  async asyncData() {
    const { data, status } = await client.post("new feed", {});
    return {
      feed: {
        next: null,
        results: data.results
      }
    };
  },
  data: () => ({
    feed: {
      next: null,
      results: []
    }
  })
};
</script>
<template>
  <b-row>
    <b-col md="8">
      <client-only>
        <news-feed :form="true" :posts="feed.results" />
        <div slot="placeholder">
          <b-card no-body class="gedf-card">
            <b-card-body>
              <instagram-loader :speed="2"></instagram-loader>
            </b-card-body>
          </b-card>
        </div>
      </client-only>
    </b-col>
    <b-col md="4">
      <div class="group-cards-wrapper">
        <group-menu-manager />
      </div>
    </b-col>
  </b-row>
</template>
<style >
.gedf-card .card--post {
  transition: all 1s;
}
.post-list-enter,
.post-list-leave-to {
  opacity: 0;
  height: 0 !important;
}
</style>