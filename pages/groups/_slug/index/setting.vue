<script>
import ModalUploadAndCropImage from "@/components/ModalUploadAndCropImage";
import { Editor, EditorContent } from "tiptap";
import { Link, Placeholder } from "tiptap-extensions";
import client from "@/services/client";
export default {
  components: { EditorContent, ModalUploadAndCropImage },
  props: ["instance", "role"],
  data() {
    return {
      loading: false,
      temp: {
        newBanner: null
      },
      updateState: {
        isUpdate: false,
        state: false,
        msg: ""
      },
      form: {
        name: "",
        description: "",
        banner: null,
        setting: {
          option1: [
            { item: "anyone", text: "Bất kì ai" },
            { item: "only_admin", text: "Chỉ quản trị viên" }
          ],
          option2: [
            { item: "anyone", text: "Bất kì ai" },
            { item: "only_admin", text: "Chỉ quản trị viên" }
          ],
          option3: [
            { item: "anyone", text: "Bất kì ai" },
            { item: "only_admin", text: "Chỉ quản trị viên" }
          ],
          can_approve_members: "anyone",
          can_post_in_group: "anyone",
          can_approve_posts: "anyone",
          allow_other_system_see_info: false
        }
      },
      editor: new Editor({
        content: _.has(this.instance, "description")
          ? this.instance.description
          : "",
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
      })
    };
  },
  computed: {
    bannerReverse() {
      if (_.has(this.temp.newBanner, "lazy_thumbnail_url")) {
        return this.temp.newBanner.lazy_thumbnail_url;
      }
      if (_.has(this.instance, "banner.lazy_thumbnail_url")) {
        return this.instance.banner.lazy_thumbnail_url;
      }
      return "https://assets-ouch.icons8.com/free-download/781/61f24427-f2dd-4ef8-8b50-4881e1ca5c69.png?filename=pablo-coming-soon.png";
    }
  },
  created() {
    if (this.role != "admin") {
      this.$nuxt.error({
        statusCode: 404,
        message: "Trang này không tồn tại!"
      });
    }
    if (this.instance && _.has(this.instance, "slug")) {
      this.assignInfoToForm(this.instance);
    }
  },
  methods: {
    assignInfoToForm(groupInfo) {
      if (
        _.has(groupInfo, "name") &&
        _.has(groupInfo, "description") &&
        _.has(groupInfo, "banner.id")
      ) {
        Object.assign(this.form, {
          name: groupInfo.name,
          description: groupInfo.description,
          banner: groupInfo.banner.id
        });
      }
      if (_.has(groupInfo, "setting.can_approve_members")) {
        Object.assign(this.form.setting, {
          can_approve_members: groupInfo.setting.can_approve_members,
          can_post_in_group: groupInfo.setting.can_post_in_group,
          can_approve_posts: groupInfo.setting.can_approve_posts,
          allow_other_system_see_info:
            groupInfo.setting.allow_other_system_see_info
        });
      }
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      this.loading = true;
      try {
        var { data, status } = await client.group("update", {
          slug: this.instance.slug,
          data_update: {
            name: this.form.name,
            description: this.form.description,
            banner: this.form.banner
          }
        });
        var { data, status } = await client.group("update setting", {
          group_setting_id: this.instance.setting.id,
          data_update: {
            can_approve_members: this.form.setting.can_approve_members,
            can_post_in_group: this.form.setting.can_post_in_group,
            can_approve_posts: this.form.setting.can_approve_posts,
            allow_other_system_see_info: this.form.setting
              .allow_other_system_see_info
          }
        });
        this.updateState = {
          isUpdate: true,
          state: true
        };
      } catch (err) {
        console.log(err.response);
        this.updateState = {
          isUpdate: true,
          state: false,
          msg: _.get(err, "response.data.detail")
        };
      }
      this.loading = false;
    },
    resetForm() {
      this.assignInfoToForm(this.instance);
      this.updateState = {
        isUpdate: false,
        state: false,
        msg: ""
      };
      this.$nextTick(() => {
        this.$refs.observer.reset();
      });
    },
    uploadSuccess(file) {
      if (_.has(file, "mimetype") && file.mimetype.includes("image/")) {
        this.temp.newBanner = file;
        this.form.banner = file.id;
      }
    }
  }
};
</script>
<template>
  <b-overlay
    :show="loading"
    v-if="instance && role == 'admin'"
    rounded
    opacity="0.9"
    spinner-small
    spinner-variant="primary"
    class="float-right"
  >
    <b-card class="gedf-card" title="Cài đặt nhóm">
      <b-alert :show="updateState.isUpdate && updateState.state" variant="success" fade dismissible>
        <fa-icon :icon="['fas','check']" />Đã cập nhật thông tin và cài đặt!
      </b-alert>
      <b-alert :show="updateState.isUpdate && !updateState.state" variant="danger" fade dismissible>
        <h4 class="alert-heading">Có gì đó không đúng!</h4>
        <hr />
        <p class="mb-0" v-show="updateState.msg">
          <b>Chi tiết</b>
          : {{updateState.msg}}
        </p>
      </b-alert>
      <validation-observer ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit( onSubmit )">
          <h6>Thông tin nhóm</h6>
          <!-- GROUP NAME -->
          <validation-provider
            name="Tên nhóm"
            :rules="{ required: true, min: 4, max: 200}"
            v-slot="validationContext"
          >
            <b-form-group
              id="input-group-name"
              label="Tên nhóm:"
              label-for="input-group-name"
              label-cols-sm="4"
              label-cols-lg="3"
            >
              <b-form-input
                id="input-group-name"
                type="text"
                required
                placeholder="Nhập tên nhóm"
                aria-describedby="input-group-name-live-feedback"
                v-model="form.name"
                :state="getValidationState(validationContext)"
              ></b-form-input>
              <b-form-invalid-feedback
                id="input-group-name-live-feedback"
              >{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>
          <!-- GROUP DESCRIPTION -->
          <b-form-group
            id="input-group-description"
            label="Mô tả nhóm:"
            label-for="input-group-description"
            label-cols-sm="4"
            label-cols-lg="3"
          >
            <div class="editor editor-form-input">
              <editor-content class="editor__content" :editor="editor" />
            </div>
          </b-form-group>

          <!-- GROUP BANNER -->
          <b-form-group
            label="Ảnh bìa nhóm:"
            label-for="input-group-banner"
            label-cols-sm="4"
            label-cols-lg="3"
          >
            <!-- <b-form-file id="input-group-banner" aria-describedby="input-group-banner-help-block"></b-form-file> -->
            <b-card overlay :img-src="bannerReverse" img-alt="Group banner" text-variant="white">
              <modal-upload-and-crop-image
                variant="primary"
                content="Upload"
                :aspectRatio="17.19/9"
                stencil="rectangle"
                @uploadsuccess="uploadSuccess"
              ></modal-upload-and-crop-image>
            </b-card>
            <input type="hidden" v-model="form.banner" />
            <b-form-text
              id="input-group-banner-help-block"
            >Kích thước ảnh bìa nhóm hoàn hảo là 1640 x 856 pixel. Các kích thước biểu ngữ này cho tỷ lệ khung hình 1,91: 1.</b-form-text>
          </b-form-group>
          <h6>Cài đặt nhóm</h6>
          <b-form-group
            id="input-group-can-approve-member"
            label="Ai có thể phê duyệt thanh viên trong nhóm này:"
            label-for="input-group-name"
            label-cols-sm="8"
          >
            <b-form-select
              v-model="form.setting.can_approve_members"
              :options="form.setting.option1"
              value-field="item"
            ></b-form-select>
          </b-form-group>
          <b-form-group
            id="input-group-can-post"
            label="Ai có thể đăng bài trong nhóm này:"
            label-for="input-group-name"
            label-cols-sm="8"
          >
            <b-form-select
              v-model="form.setting.can_post_in_group"
              :options="form.setting.option2"
              value-field="item"
            ></b-form-select>
          </b-form-group>
          <b-form-group
            id="input-group-can-post"
            label="Ai có phê duyệt đăng bài trong nhóm này:"
            label-for="input-group-name"
            label-cols-sm="8"
          >
            <b-form-select
              v-model="form.setting.can_approve_posts"
              :options="form.setting.option3"
              value-field="item"
            ></b-form-select>
          </b-form-group>
          <b-form-group>
            <b-form-checkbox
              name="input-group-setting-allow-other-system-see-info"
              aria-describedby="input-group-setting-allow-other-system-see-info-help-block"
              switch
              v-model="form.setting.allow_other_system_see_info"
            >Cho phép hệ thống bên ngoài có thể xem được thông tin nhóm này</b-form-checkbox>
            <b-form-text
              id="input-group-setting-allow-other-system-see-info-help-block"
            >Nếu lựa chọn này được bật thì cho phép các hệ thống khác tìm thấy thông tin của nhóm này, cũng có thể nhúng trang này vào hệ thống khác, hoặc cũng có thể xem thông tin nhóm mà không cần phải đăng nhập.</b-form-text>
          </b-form-group>
          <b-button type="submit" variant="primary">Lưu thay đổi</b-button>
          <b-button variant="danger" @click="resetForm()">Reset</b-button>
        </b-form>
      </validation-observer>
    </b-card>
  </b-overlay>
</template>