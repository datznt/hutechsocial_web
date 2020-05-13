<script>
import CricleAvatar from "@/components/CricleAvatar";
import VEmojiPicker, { emojisDefault, categoriesDefault } from "v-emoji-picker";
import { Editor, EditorContent } from "tiptap";
import { Link, Placeholder } from "tiptap-extensions";
import client from "@/services/client";
import _ from "lodash";
export default {
  name: "comment-form",
  components: {
    CricleAvatar,
    VEmojiPicker,
    EditorContent
  },
  props: ["parent", "object_id", "content_type"],
  data() {
    return {
      showDialog: true,
      valueInput: "",
      localId: "",
      editor: null
    };
  },
  created() {
    this.localId = _.uniqueId(this.$options.name);
  },
  mounted() {
    this.editor = new Editor({
      content: "",
      extensions: [
        new Link(),
        new Placeholder({
          emptyEditorClass: "is-editor-empty",
          emptyNodeClass: "is-empty",
          emptyNodeText: "Viết bình luận...",
          showOnlyWhenEditable: true,
          showOnlyCurrent: true
        })
      ],
      onUpdate: ({ getJSON, getHTML }) => {
        this.valueInput = getHTML();
      }
    });
  },
  methods: {
    onSelectEmoji(emoji) {
      const transaction = this.editor.state.tr.insertText(emoji.data);
      this.editor.view.dispatch(transaction);
    },
    async frmPreventSubmit() {
      if (this.valueInput.length == 0) {
        return;
      }
      try {
        const { data, status } = await client.comment("create", {
          object_id: this.object_id,
          parent: this.parent,
          content: this.valueInput
        });
        this.$emit("create-success", data);
        this.editor.clearContent(true);
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
    commitEvent() {
      // this.$nuxt.$socket.send(
      //   JSON.stringify({
      //     type: "commit",
      //     payload: {
      //       to: {
      //         object: "post",
      //         node: this.object_id
      //       },
      //       data: {
      //         clientId: this.$auth.user.id,
      //         status: "keypress"
      //       }
      //     }
      //   })
      // );
    }
  },
  beforeDestroy() {
    this.editor.destroy();
  }
};
</script>
<template>
  <!-- <div class="comments-form" :id="localId"> -->
  <div class="comments-form" :id="localId">
    <div class="comments-form-avatar">
      <cricle-avatar
        v-bind:source="$auth.user.avatar"
        defaultSource="/images/avatar-anonymous.png"
        setSize="36"
      />
    </div>
    <div class="comments-form-form">
      <b-form @submit.prevent="frmPreventSubmit">
        <!-- <textarea
          placeholder="Viết bình luận"
          v-model.trim="valueInput"
          @keydown.enter.exact.prevent="frmPreventSubmit"
        ></textarea>-->

        <div class="editor">
          <client-only placeholder="Loading...">
            <editor-content class="editor__content" :editor="editor" />
          </client-only>
        </div>

        <ul class="comments-form-form-list-buttons">
          <li>
            <b-button :id="'popover-emoji-' + localId" variant="link" class="p-0">
              <i class="far fa-smile"></i>
            </b-button>
          </li>
          <li>
            <b-button variant="link" class="p-0">
              <i class="far fa-images"></i>
            </b-button>
          </li>
          <li>
            <b-button variant="link" class="p-0" @click="frmPreventSubmit">
              <i class="fas fa-paper-plane"></i>
            </b-button>
          </li>
        </ul>
        <b-popover blur variant="fit-content" :target="'popover-emoji-' + localId" triggers="hover">
          <VEmojiPicker v-show="true" labelSearch="Search" @select="onSelectEmoji" />
        </b-popover>
      </b-form>
    </div>
  </div>
</template>
<style scoped>
.comments-form {
  display: flex;
}
.comments-form .comments-form-form {
  width: calc(100% - 36px);
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  border-radius: 1.25rem;
  margin-left: 0.25rem;
}
/* .comments-form .comments-form-form textarea {
  height: auto;
  width: 100%;
  border: none;
  text-decoration: none;
  background: transparent;
  outline-style: none;
} */
.comments-form .comments-form-form .comments-form-form-list-buttons {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.comments-form .comments-form-form .comments-form-form-list-buttons li {
  display: inline-block;
  padding: 0 0.25rem;
}
</style>
<style lang="scss">
.editor p.is-editor-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
</style>