<script>
import buildUrl from "@/plugins/build-url";
import client from "@/services/client";
import PostItem from "@/components/PostItem";
import PostForm from "@/components/PostForm";
import { InstagramLoader } from "vue-content-loader";
import ListEmpty from "@/components/ListEmpty";
export default {
  components: { PostItem, PostForm, InstagramLoader, ListEmpty },
  props: ["instance", "role"],
  data() {
    return {
      post: {
        next: "#",
        results: []
      }
    };
  },
  // async asyncData({ params }) {
  //   const { data } = await client.group("Get the posts in the group", {
  //     slug: params.slug,
  //     params_filter: {
  //       public_code: "accept"
  //     }
  //   });
  //   return {
  //     post: {
  //       next: data.next,
  //       results: data.results
  //     }
  //   };
  // },
  created() {},
  computed: {
    isShowPostForm() {
      return this.role == "admin"
        ? true
        : _.get(this.instance, "setting.can_post_in_group", "only_admin") ==
            "anyone";
    }
  },
  methods: {
    async infiniteHandler($state) {
      if (!this.post.next) {
        $state.complete();
        return;
      }
      try {
        const { data, status } = await client.group(
          "Get the posts in the group",
          {
            slug: this.instance.slug,
            url: this.post.next == "#" ? null : this.post.next,
            params_filter: {
              public_code: "accept"
            }
          }
        );
        if (data.results.length) {
          this.post.next = data.next;
          this.post.results = [...this.post.results, ...data.results];
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
    },
    createPostSuccess(data) {
      console.log(data);
    }
  }
};
</script>
<template>
  <div v-if="instance" class="post-list-wrapper w-100">
    <post-form
      v-if="isShowPostForm"
      @createSuccess="createPostSuccess"
      content_type="group"
      :object_id="instance.id"
      :role="role"
    />

    <transition-group name="post-list" tag="div">
      <post-item
        v-for="item in post.results"
        :key="item.id"
        :id="item.id"
        :content_object="item.content_object"
        :content="item.content"
        :create_at="item.create_at"
        :attaches="item.attaches"
        :summary="item.summary"
        :create_by="item.create_by"
        :my_reaction="item.my_reaction"
        :showSubTitle="false"
      />
    </transition-group>

    <client-only>
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
    </client-only>
  </div>
</template>