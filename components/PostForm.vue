<script>
import _ from "lodash";
import CricleAvatar from "./CricleAvatar";
import ModalFileManager from "@/components/ModalFileManager";
import FileItem from "@/components/FileItem";
import LinkItem from "@/components/LinkItem";
import { mapState, mapGetters } from "vuex";
import client from "@/services/client";
import VEmojiPicker, { emojisDefault, categoriesDefault } from "v-emoji-picker";
import TextEditor from "@/components/TextEditor";

export default {
  name: "post-form",
  components: {
    CricleAvatar,
    VEmojiPicker,
    ModalFileManager,
    FileItem,
    TextEditor,
    LinkItem
  },
  props: ["content_type", "object_id", "role"],
  data() {
    return {
      localId: "",
      valid: false,
      show: false,
      seleted: "",
      publicCode: {
        user: [
          { value: "anyone", text: "Mọi người" },
          { value: "only_me", text: "Chỉ mình tôi" },
          { value: "follower_following", text: "Những người theo  dõi tôi" },
          {
            value: "company_or_organization",
            text: "Chỉ các công ty hoặc tổ chức"
          }
        ]
      },
      post: {
        content_type: "",
        object_id: "",
        public_code: "anyone",
        content: "",
        attaches: []
      },
      postAttaches: [],
      currentFile: "",
      textInsert: ""
    };
  },
  computed: {
    ...mapGetters({
      loggedInUser: "loggedInUser"
    }),
    canSubmit() {
      return this.post.content != "" || this.postAttaches.length != 0;
    },
    imagevideos() {
      var fileType = client.withType("file");
      var _re = _.reduce(
        this.postAttaches,
        (arr, f) => {
          var mimeType = this.getFileType(_.get(f, "content_object"));
          if (
            f.content_type == fileType &&
            ["image", "video"].includes(mimeType)
          ) {
            arr.push({
              id: f.object_id,
              src: _.get(f, "content_object.lazy_thumbnail_url"),
              icon: `'<i class="fas fa-${mimeType}"></i>`
            });
          }
          return arr;
        },
        []
      );
      return _re;
    },
    attachLink() {
      const linkType = client.withType("link");
      const links = _.filter(
        this.postAttaches,
        (item, index) => item.content_type == linkType
      );
      if (links.length > 0) {
        return links[0].content_object;
      } else {
        return null;
      }
    }
  },
  created() {
    this.localId = _.uniqueId(this.$options.name);
    this.post.content_type = this.content_type;
    this.post.object_id = this.object_id;
    if (this.content_type == "group") {
      this.post.public_code = this.role == "admin" ? "accept" : "waiting";
    } else if (this.content_type == "company") {
      this.post.public_code = "anyone";
    }
  },
  methods: {
    async createPost() {
      this.show = true;
      try {
        Object.assign(this.post, {
          attaches: this.postAttaches.reduce((attaches, item, index) => {
            attaches.push({
              object_id: item.object_id,
              content_type: item.content_type
            });
            return attaches;
          }, [])
        });
        const { data, status } = await client.post("create", { ...this.post });
        this.$emit("createSuccess", data);
        this.resetForm();
      } catch (err) {
        console.error(err);
        this.$bvToast.toast(err.toString(), {
          title: `An error occurred`,
          toaster: "b-toaster-bottom-right",
          variant: "danger"
        });
      }
      this.show = false;
    },
    chooseImageVideo() {
      document.getElementById("imageVideoUpload").click();
    },
    async handleImageVideo() {
      this.currentFile = this.$refs.file.files[0];
      if (!this.currentFile) {
        return;
      }
      try {
        const { data, status } = await client.file("create", {
          file: this.currentFile
        });
        this.postAttaches.unshift({
          content_type: client.withType("file"),
          object_id: data.id,
          content_object: data
        });
      } catch (err) {
        this.$bvToast.toast(err.toString(), {
          title: `An error occurred`,
          toaster: "b-toaster-bottom-right",
          variant: "danger"
        });
      }
      this.currentFile = "";
    },
    removePostAttaches(att) {
      const index = _.findIndex(this.postAttaches, { object_id: att.id });
      this.postAttaches.splice(index, 1);
    },
    onSelectEmoji(emoji) {
      this.textInsert = emoji.data;
    },
    resetForm() {
      Object.assign(this.post, { content: "", attaches: [] });
      this.postAttaches = [];
      this.post.content = "";
      // this.editor.clearContent(true);
    },
    modalFileManagerSelectedFiles(files) {
      const fileType = client.withType("file");
      _.forEach(files, (f, index) => {
        if (_.findIndex(this.postAttaches, { object_id: f.id }) == -1) {
          this.postAttaches.unshift({
            object_id: f.id,
            content_type: fileType,
            content_object: f
          });
        }
      });
    },
    getFileType(file) {
      var mimetype = _.get(file, "mimetype", null);
      if (mimetype) {
        return mimetype.split("/")[0];
      }
      return null;
    },
    textEditorUpdate(newVal) {
      this.post.content = newVal;
    },
    textEditorOnPaste(e) {
      console.log(e);
    },
    textEditorStartExtractingLink(evt) {
      console.log(evt);
    },
    textEditorLinkExtractionComplete(data) {
      if (!data) {
        return;
      }
      const linkType = client.withType("link");
      this.postAttaches.unshift({
        object_id: _.get(data, "id"),
        content_type: linkType,
        content_object: data
      });
    },
    removeAttachLink() {
      const linkType = client.withType("link");
      _.remove(this.postAttaches, it => it.content_type == linkType);
    }
  }
};
</script>
<template>
  <b-overlay :show="show" rounded="sm">
    <b-card class="gedf-card card--post create-post">
      <b-form @submit.prevent="createPost">
        <div class="post-content">
          <div class="form-group mb-0">
            <div class="d-flex justify-content-lg-between align-items-stretch">
              <div class="pr-2">
                <cricle-avatar
                  v-bind:source="loggedInUser.avatar"
                  defaultSource="/images/avatar-anonymous.png"
                  setSize="36"
                />
              </div>
              <div class="text-block w-100">
                <text-editor
                  classStyle="editor--form"
                  :content="post.content"
                  :editable="true"
                  :textInsertSelection="textInsert"
                  @onUpdate="textEditorUpdate"
                  @onPaste="textEditorOnPaste"
                  @startExtractingLink="textEditorStartExtractingLink"
                  @linkExtractionComplete="textEditorLinkExtractionComplete"
                />
              </div>
            </div>

            <div
              v-if="imagevideos && imagevideos.length > 0"
              class="scrolling-wrapper mt-2"
              style="margin-left : -5px"
            >
              <transition-group name="flip-list" tag="div">
                <figure class="img-wrapper" v-for="(item) in imagevideos" :key="item.id">
                  <div class="img-wrapper-fill">
                    <b-img class="img-wrapper-fill-image" :src="item.src"></b-img>
                  </div>
                  <div class="top-left">
                    <div class="text-white">
                      <b-avatar :size="24" href="#foobar" variant="primary" v-html="item.icon"></b-avatar>
                    </div>
                  </div>
                  <div class="top-right">
                    <div class="text-dark">
                      <b-avatar
                        :size="24"
                        href="#foobar"
                        variant="danger"
                        @click="removePostAttaches(item)"
                      >
                        <i class="fas fa-times-circle"></i>
                      </b-avatar>
                    </div>
                  </div>
                </figure>
              </transition-group>
            </div>
          </div>
        </div>
        <div v-if="attachLink" class="post-link-share-wrapper ml-4 mr-4 border">
          <link-item
            :link="attachLink.link"
            :picture="attachLink.picture"
            :title="attachLink.title"
            :description="attachLink.description"
            :name="attachLink.name"
          />
          <div class="post-link-share-wrapper--float-tr" @click="removeAttachLink">
            <b-avatar :size="24" href="#" variant="danger">
              <fa-icon :icon="['fas','times-circle']" />
            </b-avatar>
          </div>
        </div>
        <div class="post-buttons d-flex justify-content-between align-items-center">
          <div class="post-buttons--left">
            <b-button class="font-weight-bold btn-sm" variant="light" @click="chooseImageVideo()">
              <i class="fas fa-photo-video" style="color:#C62168"></i> Photo/Video
            </b-button>

            <modal-file-manager
              style-class="font-weight-bold"
              variant="light"
              content="<i class='fas fa-paste' style='color:#00539C'></i> Chọn"
              size="sm"
              @selected="modalFileManagerSelectedFiles"
            />

            <b-button
              class="font-weight-bold btn-sm"
              variant="light"
              :id="'popover-emoji-' + localId"
            >
              <i class="fas fa-smile-beam" style="color:#ffc107"></i> Icons
              <b-popover
                blur
                variant="fit-content"
                :target="'popover-emoji-' + localId"
                triggers="hover"
              >
                <VEmojiPicker v-show="true" labelSearch="Search" @select="onSelectEmoji" />
              </b-popover>
            </b-button>
            <input
              id="imageVideoUpload"
              type="file"
              accept=".jpg, .jpeg, .tif, .gif, .bmp, .png, .mov, .mp4"
              hidden
              ref="file"
              @change="handleImageVideo()"
            />
          </div>
          <div class="post-buttons--right">
            <!-- <b-form-select v-model="selected" :options="options" size="sm" class="mt-3"></b-form-select> -->
            <b-button
              class="font-weight-bold btn-sm"
              variant="light"
              :disabled="!canSubmit"
              type="submit"
            >
              <i class="fas fa-plus-circle text-primary"></i> Post
            </b-button>
          </div>
        </div>
      </b-form>
    </b-card>
  </b-overlay>
</template>
<style lang="scss">
.flip-list-enter,
.flip-list-leave-to {
  opacity: 0;
  width: 0 !important;
}

.editor--form {
  padding: 1rem;
  background-color: #f3f3f3;
  border-radius: 18px;
}
.editor--form.editor-form-input {
  display: block;
  width: 100%;
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
}
.editor--form p.is-editor-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
</style>