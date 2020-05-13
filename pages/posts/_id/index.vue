<script>
import { InstagramLoader } from "vue-content-loader";
import PostItem from "@/components/PostItem";
import client from "@/services/client";

export default {
  // auth: "guest",
  auth: false,
  components: {
    PostItem,
    InstagramLoader
  },
  validate({ params }) {
    return /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/.test(
      params.id
    );
  },
  head() {
    return {
      title: this.title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content: "My custom description"
        }
      ]
    };
  },
  async asyncData ({ params }) {
    const {data,status} = await client.post("retrieve", { post_id:params.id })
    return { instance: data }
  },
  data() {
    return {
      title: "Aj",
      instance: null,
      isLoading: false
    };
  },
  created() {
    // this.fetchData();
  },
  methods: {
    async fetchData() {
      await client
        .post("retrieve", { post_id: this.$route.params.id })
        .then(resp => {
          this.instance = resp.data;
          this.isLoading = false;
        })
        .catch(err => {
          this.$nuxt.error({
            statusCode: 404,
            message: "Bài đăng này không tồn tại!"
          });
          this.isLoading = false;
        });
    }
  }
};
</script>
<template>
  <b-row align-h="center">
    <b-col>
      <b-card v-if="isLoading" no-body class="gedf-card">
        <b-card-body>
          <instagram-loader :speed="2"></instagram-loader>
        </b-card-body>
      </b-card>
      <post-item
        v-else
        v-bind:id="instance.id"
        v-bind:content_object="instance.content_object"
        v-bind:content="instance.content"
        v-bind:create_at="instance.create_at"
        v-bind:attaches="instance.attaches"
        v-bind:summary="instance.summary"
        v-bind:create_by="instance.create_by"
        v-bind:my_reaction="instance.my_reaction"
        :expandCommentList="true"
      />
    </b-col>
  </b-row>
</template>