<script>
import CommentItem from "@/components/CommentItem";
import CommentForm from "@/components/CommentForm";
import client from "@/services/client";
import _ from 'lodash';
import { ContentLoader } from "vue-content-loader";

export default {
  name: "comment-list",
  props: ["form", "content_type", "object_id", "parent", "type", "focus"],
  components: {
    CommentItem,
    CommentForm,
    ContentLoader
  },
  data: () => ({
    location: "",
    loading: false,
    valid: true,
    comment: {
      next: "",
      results: []
    }
  }),
  watch: {
    loading: _.debounce(function() {
      this.scrollToFocus();
    }, 1000)
  },
  created() {
    this.loadMore();
  },
  methods: {
    commentFormCreateSuccess(newComment) {
      this.comment.results.push(newComment);
    },
    async loadMore() {
      this.loading = true;
      try {
        const { data, status } = await client.comment("get", {
          url: this.comment.next,
          object_id: this.object_id,
          parent: this.parent
        });
        this.comment.next = data.next;
        this.comment.results = _.uniqWith(
          [...this.comment.results, ...data.results],
          _.isEqual
        );
        this.focusToComment();
      } catch (err) {
        console.error(err);
      }
      this.loading = false;
    },
    async focusToComment() {
      if (!this.focus) {
        return;
      }
      if (
        _.findIndex(this.comment.results, cmt => cmt.id == this.focus) != -1
      ) {
        return;
      }
      try {
        const { data, status } = await client.comment("retrieve", {
          comment_id: this.focus
        });
        this.comment.results.push(data);
      } catch (err) {
        console.error(err);
      }
    },
    deleteComment(id) {
      _.remove(this.comment.results, { id: id });
      this.comment.results = [...this.comment.results];
    },
    canNext() {
      return this.comment.next && this.comment.next.length > 0;
    },
    scrollToFocusDone() {
      this.$emit("scroll-to-focus-done");
    },
    scrollToFocus() {
      if (!this.loading && this.focus) {
        this.$scrollTo("#cmt_" + this.focus, 500, {
          onDone: this.scrollToFocusDone
        });
      }
    }
  }
};
</script>
<template>
  <div class="comments-wrapper">
    <!-- LIST COMMENT -->
    <div class="comments-list-wrapper">
      <comment-item
        v-for="(comment,i) in comment.results"
        :key="i"
        :id="comment.id"
        :create_by="comment.create_by"
        :create_at="comment.create_at"
        :content="comment.content"
        :summary="comment.summary"
        :parent="parent"
        :my_reaction="comment.my_reaction"
        :object_id="object_id"
        :type="type"
        @deleteComment="deleteComment"
        :isFocus="comment.id == focus"
      />
      <b-button variant="link" v-if="canNext()" @click="loadMore">
        Show more
        <i class="fas fa-arrow-down" v-if="!loading"></i>
        <i class="fas fa-spinner fa-spin" v-else></i>
      </b-button>
    </div>
    <!-- LIST COMMENT -->

    <!-- PLACEHOLDER LOADING -->
    <content-loader v-if="loading" :speed="2" height="85">
      <circle cx="18" cy="18" r="18" />
      <rect x="40" y="0" rx="18" ry="18" width="236" height="76" />
    </content-loader>
    <!-- PLACEHOLDER LOADING -->

    <!-- COMMENT FORM -->
    <comment-form
      v-show="form"
      :parent="parent"
      :object_id="object_id"
      @create-success="commentFormCreateSuccess"
    />
    <!-- COMMENT FORM -->
  </div>
</template>
<style scoped>
</style>