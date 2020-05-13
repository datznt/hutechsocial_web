<script>
import { Editor, EditorContent } from "tiptap";
import { Link, Placeholder } from "tiptap-extensions";
import client from "@/services/client";
export default {
  name: "group-form",
  components: { EditorContent },
  props: ["location"],
  data() {
    return {
      localUserId: "",
      form: {
        name: "",
        description: "<p></p>"
      },
      editor: new Editor({
        content: "",
        extensions: [
          new Link(),
          new Placeholder({
            emptyEditorClass: "is-editor-empty",
            emptyNodeClass: "is-empty",
            emptyNodeText: "Mô tả về nhóm này?",
            showOnlyWhenEditable: true,
            showOnlyCurrent: true
          })
        ],
        onUpdate: ({ getJSON, getHTML }) => {
          this.form.description = getHTML();
        }
      }),
      freeze: false
    };
  },
  created() {
    this.localUserId = this.$auth.user.id;
  },
  computed: {
    invalidGroupNameFeedback() {
      if (this.form.name.length == 0) {
        return "Vui lòng nhập tên nhóm";
      } else {
        if (this.form.name.length > 0 && this.form.name.length < 4) {
          return "Tên nhóm tối thiểu 4 ký tự";
        } else {
          return "";
        }
      }
    },
    validGroupNameFeedback() {
      return this.state === true ? "" : "";
    },
    invalidGroupDescriptionFeedback() {
      if (this.form.description === "<p></p>") {
        return "Vui lòng nhập mô tả nhóm";
      } else {
        return "";
      }
    },
    validGroupDescriptionFeedback() {
      return this.state === true ? "" : "";
    },
    state() {
      return this.form.name.length >= 4 && this.form.description != "<p></p>";
    }
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this._createGroup(this.form);
    },
    onReset(evt) {
      evt.preventDefault();
      this.form.name = "";
      this.form.description = "";
    },
    async _createGroup(data) {
      this.freeze = true;
      await client
        .group("create", { ...this.form })
        .then(resp => {
          this.freeze = true;
          this.$emit("createSuccess", resp.data);
        })
        .catch(err => {
          this.freeze = false;
          console.error(err);
          this.$bvToast.toast(err.toString(), {
            title: `An error occurred`,
            toaster: "b-toaster-bottom-right",
            variant: "danger"
          });
        });
      // await this.$axios
      //   .$post(this.location, data)
      //   .then(resp => {
      //     this.freeze = true;
      //     this.$emit("createSuccess", resp);
      //   })
      //   .catch(err => {
      //     console.error(err);
      //     this.freeze = false;
      //   });
    }
  }
};
</script>

<template>
  <div class="group-form-wrapper w-100">
    <b-form @submit="onSubmit" @reset="onReset">
      <p
        class="mb-1"
      >Nhóm là không gian tuyệt vời để hoàn thành công việc và chỉ liên lạc với những người bạn muốn. Hãy chia sẻ ảnh và video, trò chuyện, lên kế hoạch và nhiều hoạt động khác.</p>
      <div class="mb-3">
        <b-card
          overlay
          img-src="https://static.xx.fbcdn.net/rsrc.php/v1/yT/r/1jNTw3r299x.jpg"
          img-alt="Card Image"
          text-variant="white"
        ></b-card>
      </div>

      <b-form-group
        id="input-group-name"
        label="Tên nhóm:"
        label-for="input-group-name"
        :invalid-feedback="invalidGroupNameFeedback"
        :valid-feedback="validGroupNameFeedback"
        :state="state"
      >
        <b-form-input
          id="input-group-name"
          v-model="form.name"
          type="text"
          required
          :state="state"
          trim
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="input-group-name"
        label="Mô tả nhóm:"
        label-for="input-group-name"
        :invalid-feedback="invalidGroupDescriptionFeedback"
        :valid-feedback="validGroupDescriptionFeedback"
        :state="state"
      >
        <div class="editor">
          <editor-content class="editor__content" :editor="editor" />
        </div>
      </b-form-group>

      <b-overlay :show="freeze" rounded opacity="0.6" spinner-small spinner-variant="primary" class="float-right ml-2" >
        <b-button :disabled="!state" type="submit" variant="primary">Tạo mới</b-button>
      </b-overlay>
      <b-button v-show="!freeze" class="float-right" type="reset" variant="light">Huỷ bỏ</b-button>
    </b-form>
  </div>
</template>
<style>
.group-form-wrapper .editor__content {
  padding: 0.375rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  min-height: 5rem;
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
