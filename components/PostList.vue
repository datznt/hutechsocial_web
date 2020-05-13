<script>
import PostItem from "@/components/PostItem";
import PostForm from "@/components/PostForm";
import client from "@/services/client";
export default {
  name: "post-list",
  components: {
    PostItem,
    PostForm
  },
  props: ["content_type", "object_id", "form",],
  data() {
    return {
      post: {
        next: "",
        results: []
      }
    };
  },
  methods: {
    async infiniteHandler($state) {
      // if (!this.post.next) {
      //   $state.complete();
      //   return;
      // }
      await client
        .post("get", {
          content_type: this.content_type,
          object_id: this.object_id,
          url: this.post.next,
        })
        .then(resp => {
          if (resp.data.results.length) {
            this.post.next = resp.data.next;
            this.post.results = [...this.post.results, ...resp.data.results];
            $state.loaded();
          } else {
            $state.complete();
          }
        })
        .catch(err => {
          /*ERROR
            An error occurred,
            please check the connection or try again in a few minutes
          */
         console.error(err);
          this.$bvToast.toast(
            `An error occurred, please check the connection or try again in a few minutes!`,
            {
              title: `An error occurred`,
              toaster: "b-toaster-bottom-right",
              variant: "danger"
            }
          );
        });
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
      :content_type="content_type" 
      :object_id="object_id"
      @createSuccess="createPostSuccess" 
    />
    <!-- Post /////-->

    <!--- \\\\\\\Post-->
    <transition-group name="post-list" tag="div">
      <post-item
        v-for="post in post.results"
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

    <infinite-loading @infinite="infiniteHandler"></infinite-loading>
  </div>
</template>