<script>
import { Cropper, CircleStencil, RectangleStencil } from "vue-advanced-cropper";
import client from "@/services/client";
export default {
  name: "modal-upload-and-crop-image",
  components: {
    Cropper,
    CircleStencil,
    RectangleStencil
  },
  props: {
    variant: {
      type: String,
      default: "primary"
    },
    styleClass: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: "md"
    },
    content: {
      type: String,
      default: "Upload"
    },
    requiredEditImage: {
      type: Boolean,
      default: false
    },
    stencil: {
      type: String,
      default: "rectangle"
    },
    aspectRatio: {
      type: Number,
      default: null
    }
  },
  data: () => ({
    modalTitle: "",
    form: {
      raw: null
    },
    preview: {
      src: null,
      coordinates: {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },
      isPreview: false
    },
    source: {
      src: null,
      fileName: null,
      type: null
    }
  }),
  computed: {
    modalTitleReverse() {
      return this.modalTitle ? this.modalTitle : "Không có hình nào được chọn";
    },
    stencilReverse() {
      return this.stencil == "rectangle" ? RectangleStencil : CircleStencil;
    }
  },
  methods: {
    handleImage() {
      let currentFile = this.$refs.image.files[0];
      if (currentFile) {
        console.log(currentFile);

        this.source = {
          raw: URL.createObjectURL(currentFile),
          fileName: currentFile.name,
          type: currentFile.type
        };
        this.modalTitle = currentFile.name;
      }
    },
    clearImage() {
      this.source = {
        raw: null,
        fileName: null
      };
      this.modalTitle = null;
      this.preview = {
        src: null,
        coordinates: {
          width: 0,
          height: 0,
          left: 0,
          top: 0
        },
        isPreview: false
      };
    },
    onChange({ coordinates, canvas }) {
      this.preview.coordinates = coordinates;
      // You able to do different manipulations at a canvas
      // but there we just get a cropped image
      this.preview.src = canvas.toDataURL();
    },
    getCropImage(callback) {
      const { coordinates, canvas } = this.$refs.cropper.getResult();
      this.coordinates = coordinates;
      // You able to do different manipulations at a canvas
      // but there we just get a cropped image
      return canvas.toBlob(callback);
    },
    async uploadImage() {
      try {
        this.getCropImage(async blob => {
          const { data, status } = await client.file("create", {
            file: new File([blob], this.source.fileName, {
              type: this.source.type
            })
          });
          if (status == 201) {
            this.$emit("uploadsuccess", data);
            this.$bvModal.hide("modal-upload-and-crop-image");
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  }
};
</script>
<template>
  <b-button
    :variant="variant"
    :class="[styleClass]"
    :size="size"
    id="show-modal-upload-and-crop-image"
    v-b-modal="'modal-upload-and-crop-image'"
    v-b-tooltip.hover
    title="Upload hình ảnh"
  >
    <span v-html="content"></span>
    <b-modal id="modal-upload-and-crop-image" hide-footer centered :title="modalTitleReverse">
      <b-container>
        <b-row v-if="!source.raw" class="choose-image-wrapper">
          <div class="d-flex justify-content-center align-items-center w-100">
            <div class="drop-zone">
              <div class="drop-zone-button">
                <input
                  type="file"
                  name="input-image"
                  id="image"
                  accept=".jpg, .jpeg, .tif, .bmp, .png"
                  ref="image"
                  @change="handleImage()"
                />
                <!-- <b-button variant="primary" class="mb-2">Chọn hình ảnh</b-button> -->
                <small>Hoặc thả hình vào đây</small>
              </div>
            </div>
          </div>
        </b-row>
        <b-row v-else class="crop-image-wrapper">
          <div class="crop-image w-100">
            <div class="crop-image-cropper">
              <cropper
                class="crop-image-cropper-area"
                v-show="!preview.isPreview"
                ref="cropper"
                :src="source.raw"
                :stencil-props="{
                    aspectRatio: aspectRatio
                }"
                :stencilComponent="stencilReverse"
                @change="onChange"
              ></cropper>
              <div v-show="preview.isPreview" class="crop-image-cropper-preview">
                <img :src="preview.src" />
              </div>
            </div>
            <div class="crop-image-tools">
              <div class="crop-image-tools-left">
                <b-button variant="outline-danger" size="sm" @click="clearImage()">Chọn lại</b-button>
                <b-button
                  variant="light"
                  size="sm"
                  @click="preview.isPreview = !preview.isPreview"
                  v-b-tooltip.hover
                  title="Xem trước hình chỉnh sửa"
                >
                  <fa-icon :icon="['fas', preview.isPreview ? 'eye-slash' : 'eye' ]" />
                </b-button>
              </div>
              <div class="crop-image-tools-right">
                <b-button variant="primary" size="sm" @click="uploadImage()">
                  <fa-icon :icon="['fas','upload']" /> &nbsp;Upload
                </b-button>
              </div>
            </div>
          </div>
        </b-row>
      </b-container>
    </b-modal>
  </b-button>
</template>
<style lang="scss" scoped>
.drop-zone {
  background-color: #eff0f9;
  height: 15rem;
  width: 100%;
  border-radius: 1rem;
  clear: both;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #5a5a5a;

  &-button {
    align-self: center;
    display: flex;
    justify-content: center;
    align-items: center;
    clear: both;
    flex-direction: column;
  }
}
.crop-image {
  &-tools {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    // &-left {
    // }
    // &-right {
    // }
  }
  &-cropper {
    &-area,
    &-preview {
      width: 100%;
    }
    &-preview {
      img {
        width: 100%;
        height: auto;
      }
    }
  }
}
</style>