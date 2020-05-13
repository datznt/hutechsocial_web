<script>
import CricleAvatar from "@/components/CricleAvatar";
import ReactionButton from "@/components/ReactionButton";
import ReactionIcon from "@/components/ReactionIcon";
import { Editor, EditorContent } from "tiptap";
import { Link } from "tiptap-extensions";
import client, { linkTemplates } from "@/services/client";
// import TimeAgo from "vue2-timeago";
export default {
  name: "comment-item",
  components: {
    // TimeAgo,
    CricleAvatar,
    CommentList: () => import("@/components/CommentList"),
    ReactionButton,
    ReactionIcon,
    EditorContent
  },
  props: [
    "id",
    "create_by",
    "create_at",
    "content",
    "summary",
    "parent",
    "my_reaction",
    "object_id",
    "isFocus",
    "type"
  ],
  data() {
    let { content } = this;
    return {
      showReplies: false,
      editable: false,
      editor: new Editor({
        content: content,
        editable: false,
        extensions: [new Link()]
      }),
      showCommentButton: false,
      focusReplyCommentId: null
    };
  },
  watch: {
    editable() {
      this.editor.setOptions({
        editable: this.editable
      });
    }
  },
  computed: {
    hasReactions() {
      if (!_.has(this.summary, "reactions_count")) {
        return false;
      }
      return (
        this.summary.reactions_count["1"] != 0 ||
        this.summary.reactions_count["2"] != 0 ||
        this.summary.reactions_count["3"] != 0 ||
        this.summary.reactions_count["4"] != 0 ||
        this.summary.reactions_count["5"] != 0
      );
    },
    isMyComment() {
      return this.create_by.id == this.$auth.user.id;
    },
    role() {
      return _.get(this.create_by, "id") == _.get(this.$auth, "user.id")
        ? this.ROLES[0]
        : this.ROLES[1];
    },
    reverseId() {
      return "cmt_" + this.id;
    }
  },
  created() {
    this.ROLES = ["owner", "none"];
    this.focusToReplyComment();
  },
  methods: {
    editComment() {
      this.editable = true;
    },
    async deleteComment() {
      try {
        await client.comment("delete", { comment_id: this.id });
        this.$emit("deleteComment", this.id);
      } catch (err) {
        console.log(err);
      }
    },
    copyLink() {
      try {
        var _link = null;
        if (this.type == "comment") {
          _link = _.template(linkTemplates.COMMENT)({
            domain: window.location.origin,
            post_id: this.object_id,
            comment_id: this.id
          });
        } else {
          _link = _.template(linkTemplates.REPLY_COMMENT)({
            domain: window.location.origin,
            post_id: this.object_id,
            comment_id: this.parent,
            reply_comment_id: this.id
          });
        }
        client.copyToClipboard(_link);
        this.$bvToast.toast(`Link đã được copy vào clipboard!`, {
          variant: "success",
          toaster: "b-toaster-bottom-center"
        });
      } catch (err) {
        console.log(err);
      }
    },
    focusToReplyComment() {
      const replyCommentId = _.get(this.$route, "query.reply_comment_id", null);
      const commentId = _.get(this.$route, "query.comment_id", null);
      if (this.id == commentId && replyCommentId) {
        this.showReplies = true;
        this.focusReplyCommentId = replyCommentId;
      }
    }
  }
};
</script>
<template>
  <div class="comment-item" :id="reverseId">
    <div
      class="comment-item-wrapper"
      @mouseover="showCommentButton = true"
      @mouseleave="showCommentButton = false"
    >
      <div class="comment-item-avatar">
        <cricle-avatar
          v-bind:source="create_by.avatar"
          defaultSource="/images/avatar-anonymous.png"
          setSize="36"
        />
      </div>
      <div class="comment-item-content">
        <div
          :class="['comment-item-content-wrapper',{
          'comment-item-content-wrapper--focus' : isFocus
        }]"
        >
          <b-form>
            <span class="comment-item-content-text">
              <nuxt-link to="#" class="font-weight-bolder text-primary">{{create_by.full_name}}</nuxt-link>
            </span>
            <editor-content class="editor__content" :editor="editor" />
          </b-form>
          <div v-if="hasReactions" class="comment-item-content-reactions-detail">
            <reaction-icon :reactions_count="summary.reactions_count" :my_reaction="my_reaction" />
          </div>
        </div>
        <ul class="comment-item-content-list-buttons">
          <li>
            <reaction-button
              :my_reaction="my_reaction"
              type="comment"
              :object_id="id"
              style-class="reaction-icon-65"
            />
          </li>
          <li v-if="type == 'comment'">
            <b-button variant="link" class="p-0" @click="showReplies = !showReplies">Reply</b-button>
          </li>
          <li>
            <small class="text-muted">
              -
              <!-- <time-ago :datetime="create_at" :auto-update="60"></time-ago> -->
            </small>
          </li>
        </ul>
      </div>
      <div class="comment-item-button" :class="{'comment-item-button--show' : showCommentButton}">
        <b-dropdown
          id="gedf-drop1"
          variant="link"
          right
          toggle-class="text-decoration-none btn-link"
          no-caret
        >
          <template v-slot:button-content>
            <i class="fas fa-ellipsis-h text-muted"></i>
          </template>
          <b-dropdown-item @click="copyLink">
            <fa-icon :icon="['fas','link']" />&nbsp;Lấy liên kết
          </b-dropdown-item>
          <b-dropdown-item v-if="role == ROLES[0]" @click="editComment">
            <fa-icon :icon="['fas','pencil-alt']" />&nbsp;Chỉnh sửa
          </b-dropdown-item>
          <b-dropdown-item v-if="role == ROLES[0]" @click="deleteComment">
            <fa-icon :icon="['fas','trash-alt']" />&nbsp;Xoá
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
    <div class="comment-item-replies">
      <div class="comment-item-replies--tab">
        <b-button
          v-if="summary.replies_count != 0"
          v-show="!showReplies"
          @click="showReplies = !showReplies"
          variant="link"
          class="p-0 comment-item-replies-icon"
        >
          <i class="fas fa-reply"></i>
          {{summary.replies_count}} phản hồi
        </b-button>
        <!-- <comment-list v-if="showReplies" :form="true" :replies="replies" type="replies" /> -->
        <comment-list
          v-if="showReplies"
          :form="true"
          :object_id="object_id"
          :parent="id"
          content_type="post"
          type="reply_comment"
          :focus="focusReplyCommentId"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.comment-item .comments-wrapper {
  margin-top: 0.25rem;
}
.comment-item {
  margin-bottom: 0.25rem;
}
.comment-item-wrapper {
  display: flex;
}
.comment-item .comment-item-button {
  visibility: hidden;
}
.comment-item .comment-item-button--show {
  visibility: visible;
}
.comment-item .comment-item-content {
  /* width: calc(100% - 36px); */
  margin-left: 0.25rem;
}
.comment-item .comment-item-content .comment-item-content-wrapper {
  border-radius: 1.25rem;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  position: relative;
}
.comment-item .comment-item-content .comment-item-content-wrapper--focus {
  background: #28a74526;
}
.comment-item .comment-item-content textarea {
  height: auto;
  width: 100%;
  border: none;
  text-decoration: none;
  background: transparent;
  outline-style: none;
}
.comment-item .comment-item-content .comment-item-content-list-buttons {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.comment-item .comment-item-content .comment-item-content-list-buttons li {
  display: inline-block;
  padding: 0 0.25rem;
}
.comment-item .comment-item-content .comment-item-content-list-buttons li .btn {
  font-size: 12px;
}
.comment-item-replies--tab {
  padding-left: 36px;
}
.comment-item-replies-icon i {
  transform: rotate(180deg);
}
.comment-item-content {
  position: relative;
}
.comment-item-content .comment-item-content-reactions-detail {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  padding: 0.25rem;
  border-radius: 1rem;
}
.comment-item-content .comment-item-content-reactions-detail .btn.btn-link {
  margin: 0 !important;
  padding: 0 !important;
}
</style>