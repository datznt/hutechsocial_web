<script>
import buildUrl from "@/plugins/build-url";
import client from "@/services/client";
import PostItem from "@/components/PostItem";
import PostForm from "@/components/PostForm";
import ListEmpty from "@/components/ListEmpty";
import { InstagramLoader } from "vue-content-loader";
import _ from "lodash";
export default {
  components: { PostItem, PostForm, InstagramLoader, ListEmpty },
  props: ["instance", "role"],
  async asyncData({ params }) {
    try {
      const { data, status } = await client.company(
        "Get the posts in the company",
        {
          slug: params.slug,
          params_filter: {
            public_code: "anyone"
          }
        }
      );
      console.log(data);

      return {
        post: {
          next: data.next,
          results: data.results
        }
      };
    } catch (err) {
      error({
        statusCode: _.get(err, "response.status", 500),
        message: "Có gì đó không đúng!"
      });
    }
  },
  data() {
    return {
      post: {
        next: "",
        results: []
      }
    };
  },
  created() {},
  methods: {
    async infiniteHandler($state) {
      if (!this.post.next) {
        $state.complete();
        return;
      }
      try {
        const { data, status } = await client.company(
          "Get the posts in the company",
          {
            slug: this.instance.slug,
            url: this.post.next,
            params_filter: {
              public_code: "anyone"
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
      }
    },
    createPostSuccess(data) {
      this.post.results.unshift(data);
    }
  }
};
</script>
<template>
  <div v-if="instance" class="post-list-wrapper w-100">
    <client-only>
      <post-form
        v-if="role == 'owner'"
        @create-success="createPostSuccess"
        content_type="company"
        :object_id="instance.id"
        :role="role"
      />
    </client-only>

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

    <b-card v-if="!post.results.length" no-body class="gedf-card">
      <b-card-body>
        <list-empty></list-empty>
      </b-card-body>
    </b-card>

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
          <div class="d-none"></div>
        </div>
      </infinite-loading>
    </client-only>
  </div>
</template>