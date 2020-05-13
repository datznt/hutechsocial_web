<script>
import PostItem from "@/components/PostItem";
import PostForm from "@/components/PostForm";
import { InstagramLoader } from "vue-content-loader";
import ListEmpty from "@/components/ListEmpty";
import client from "@/services/client";
export default {
  name: "news-feed",
  components: {
    PostItem,
    PostForm,
    InstagramLoader,
    ListEmpty
  },
  props: ["form","posts"],
  // async asyncData() {
  //   const { data, status } = await client.post("new feed");
  //   return {
  //     feed: {
  //       next: null,
  //       results: data.results
  //     }
  //   };
  // },
  data() {
    return {
      feed: {
        next: "",
        results: []
      },
      loadCompleted: false
    };
  },
  created(){
    this.feed.results = this.posts;
  },  
  methods: {
    async infiniteHandler($state) {
      if (!this.feed.next) {
        $state.complete();
        return;
      }
      this.loadCompleted = false;
      try {
        const { data, status } = await client.post("new feed", {
          url: this.feed.next == "#" ? null : this.feed.next
        });
        if (data.results.length) {
          this.feed.next = data.next;
          this.feed.results = [...this.feed.results, ...data.results];
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        this.$bvToast.toast(
          `An error occurred, please check the connection or try again in a few minutes!`,
          {
            title: `An error occurred`,
            toaster: "b-toaster-bottom-right",
            variant: "danger"
          }
        );
      }
      this.loadCompleted = true;
    },
    createPostSuccess(data) {
      console.log(data);
    }
  }
};
</script>
<template>
  <div class="post-list">
    <!--- \\\\\\\Post-->
    <post-form
      v-show="form"
      @createSuccess="createPostSuccess"
      content_type="user"
      :object_id="$auth.user.id"
    />
    <!-- Post /////-->

    <!--- \\\\\\\Post-->
    <transition-group name="post-list" tag="div">
      <post-item
        v-for="post in feed.results"
        :key="post.id"
        v-bind:id="post.id"
        v-bind:content_object="post.content_object"
        v-bind:content="post.content"
        v-bind:create_at="post.create_at"
        v-bind:attaches="post.attaches"
        v-bind:summary="post.summary"
        v-bind:create_by="post.create_by"
        v-bind:my_reaction="post.my_reaction"
      />
    </transition-group>
    <!-- Post /////-->

    <infinite-loading @infinite="infiniteHandler">
      <div slot="spinner">
        <b-card no-body class="gedf-card">
          <b-card-body>
            <instagram-loader :speed="2"></instagram-loader>
          </b-card-body>
        </b-card>
      </div>
      <div slot="no-results">
        <b-card no-body class="gedf-card">
          <b-card-body>
            <list-empty></list-empty>
          </b-card-body>
        </b-card>
      </div>
    </infinite-loading>
  </div>
</template>