<script>
import _ from "lodash";
import FileItem from "@/components/FileItem";
import ListEmpty from "@/components/ListEmpty";
import ModalUploadAndCropImage from "@/components/ModalUploadAndCropImage";
import { BulletListLoader } from "vue-content-loader";
import client from "@/services/client";
export default {
  name: "form-file-manager",
  components: {
    ListEmpty,
    FileItem,
    ModalUploadAndCropImage,
    BulletListLoader
  },
  props: {
    multipleSelect: {
      type: Boolean,
      default: true
    },
    imageModal: {
      type: Object,
      default: () => ({
        stencil: "rectangle",
        aspectRatio: 1
      })
    }
  },
  data: () => ({
    q: "",
    file: {
      ordering: {
        options: [
          { item: 1, html: "Tên file A-Z" },
          { item: 2, text: "Tên file Z-A" },
          { item: 3, text: "Ngày upload tăng dần" },
          { item: 4, text: "Ngày upload giảm dần" },
          { item: 5, text: "Kích thước file tăng dần" },
          { item: 6, text: "Kích thước file giảm dần" }
        ],
        selected: 1
      },
      filter: {
        type: {
          options: [
            { item: 0, text: "Loại file" },
            { item: 1, text: "Hình ảnh" },
            { item: 2, text: "Video" },
            { item: 3, text: "Âm thanh" },
            { item: 4, text: "Khác" },
            { item: 5, text: "Tất cả" }
          ],
          selected: 0
        },
        size: {
          options: [
            { item: 0, text: "Kích thước file" },
            { item: 1, text: "Dưới 10MB" },
            { item: 2, text: "Dưới 100MB" },
            { item: 3, text: "Dưới 500MB" },
            { item: 4, text: "Trên 500MB" },
            { item: 5, text: "Tất cả" }
          ],
          selected: 0
        },
        timestamp: {
          options: [
            { item: 0, text: "Ngày đăng tải" },
            { item: 1, text: "Hôm nay" },
            { item: 2, text: "Hôm qua" },
            { item: 3, text: "7 ngày trước" },
            { item: 4, text: "Tháng này" },
            { item: 5, text: "Năm này" },
            { item: 6, text: "Tất cả" }
          ],
          selected: 0
        }
      },
      data: {
        next: "#",
        results: []
      },
      identifier: ""
    },
    selectedItems: [],
    loading: {
      isLoading: false,
      message: null
    },
    currentFile: null
  }),
  watch: {
    q: _.debounce(function() {
      this.filterFileChange(this.q);
    }, 1000),
    selectedItems(newValue) {
      this.$emit("select-changed", newValue);
    }
  },
  computed: {
    selectedItemsName() {
      return _.reduce(
        this.selectedItems,
        (arr, f) => {
          arr.push(f.data.id);
          return arr;
        },
        []
      );
    }
  },
  methods: {
    async infiniteHandler($state) {
      if (!this.file.data.next) {
        $state.complete();
        return;
      }
      try {
        var condition = this.filterFileCondition();
        condition["create_by"] = _.get(this.$auth, "user.id");
        const { data } = await client.file("get", {
          url: this.file.data.next == "#" ? null : this.file.data.next,
          params_filter: condition
        });
        if (data.results.length) {
          var reduceData = _.reduce(
            data.results,
            (arr, item) => {
              var isSeleted =
                _.findIndex(this.selectedItems, f => f.data.id == item.id) !=
                -1;
              arr.push({
                selected: isSeleted,
                data: item
              });
              return arr;
            },
            []
          );
          Object.assign(this.file.data, {
            next: data.next,
            results: [...this.file.data.results, ...reduceData]
          });
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        console.error(err);
      }
    },
    filterFileChange(e) {
      this.file.identifier = e;
      this.file.data = {
        next: "#",
        results: []
      };
    },
    filterFileCondition() {
      let condition = {};
      condition["name__icontains"] = this.q;
      // filter condition
      if ([1, 2, 3, 4].includes(this.file.filter.type.selected)) {
        if (this.file.filter.type.selected == 1) {
          // image
          condition["mimetype__istartswith"] = "image/";
        } else if (this.file.filter.type.selected == 2) {
          // video
          condition["mimetype__istartswith"] = "video/";
        } else if (this.file.filter.type.selected == 3) {
          // audio
          condition["mimetype__istartswith"] = "audio/";
        } else if (this.file.filter.type.selected == 4) {
          // application
          condition["mimetype__istartswith"] = "application/";
        }
      }
      if ([1, 2, 3, 4].includes(this.file.filter.size.selected)) {
        const mb = 1024 * 1024;
        if (this.file.filter.size.selected == 1) {
          // Dưới 10MB
          condition["size__lte"] = 10 * mb;
        } else if (this.file.filter.size.selected == 2) {
          // Dưới 100MB
          condition["size__lte"] = 100 * mb;
        } else if (this.file.filter.size.selected == 3) {
          // Dưới 500MB
          condition["size__lte"] = 500 * mb;
        } else if (this.file.filter.size.selected == 4) {
          // Trên 500MB
          condition["size__gte"] = 500 * mb;
        }
      }
      if ([1, 2, 3, 4, 5].includes(this.file.filter.timestamp.selected)) {
        if (this.file.filter.timestamp.selected == 1) {
          // Today
          condition["create_at"] = "today";
        } else if (this.file.filter.timestamp.selected == 2) {
          // Yesterday
          condition["create_at"] = "yesterday";
        } else if (this.file.filter.timestamp.selected == 3) {
          // Past 7 days
          condition["create_at"] = "week";
        } else if (this.file.filter.timestamp.selected == 4) {
          // This month
          condition["create_at"] = "month";
        } else if (this.file.filter.timestamp.selected == 5) {
          // This Year
          condition["create_at"] = "year";
        }
      }
      // sorting condition
      var ordering = null;
      if (this.file.ordering.selected == 1) {
        ordering = "name";
      } else if (this.file.ordering.selected == 2) {
        ordering = "-name";
      } else if (this.file.ordering.selected == 3) {
        ordering = "create_at";
      } else if (this.file.ordering.selected == 4) {
        ordering = "-create_at";
      } else if (this.file.ordering.selected == 5) {
        ordering = "size";
      } else if (this.file.ordering.selected == 6) {
        ordering = "-size";
      }
      condition["ordering"] = ordering;
      return condition;
    },
    handleClick(file) {
      if (file.selected) {
        file.selected = false;
        _.remove(this.selectedItems, f => f.data.id == file.data.id);
        this.selectedItems = [...this.selectedItems];
      } else {
        if (!this.multipleSelect) {
          _.forEach(this.selectedItems, slt => this.handleClick(slt));
        }
        this.selectedItems.push(file);
        file.selected = true;
      }
    },
    uploadImageSuccess(file) {
      var newItem = { data: file, selected: true };
      this.file.data.results.splice(0, 0, newItem);
      this.selectedItems.push(newItem);
    },
    deselectSelectedFiles() {
      this.selectedItems = [];
      _.forEach(this.file.data.results, (f, index) => {
        f.selected = false;
      });
    },
    async deleteSelectedFiles() {
      var doneList = [];
      this.loading.isLoading = true;
      try {
        for (let index = 0; index < this.selectedItems.length; index++) {
          const file = this.selectedItems[index];
          const fileId = _.get(file, "data.id", null);
          this.loading.message = `Đang xoá: ${_.get(file, "data.name")}`;
          if (file.selected && fileId) {
            const { status } = await client.file("delete", {
              file_id: fileId
            });
            doneList.push(fileId);
          }
        }
      } catch (err) {
        console.error(err);
      }
      _.forEach(doneList, (fileId, index) => {
        _.remove(this.file.data.results, f => f.data.id == fileId);
        _.remove(this.selectedItems, f => f.data.id == fileId);
      });
      this.loading.isLoading = false;
    },
    async fileSelectChange() {
      if (this.$refs.fileVideo.files.length) {
        this.currentFile = this.$refs.fileVideo.files[0];
      }
      if (this.$refs.fileAudio.files.length) {
        this.currentFile = this.$refs.fileAudio.files[0];
      }
      if (this.$refs.fileApplication.files.length) {
        this.currentFile = this.$refs.fileApplication.files[0];
      }

      if (!this.currentFile) {
        return;
      }
      try {
        const { data, status } = await client.file("create", {
          file: this.currentFile
        });
        var _re = { selected: true, data: data };
        this.file.data.results.splice(0, 0, _re);
        this.selectedItems.push(_re);
      } catch (err) {
        this.$bvToast.toast(err.toString(), {
          title: `An error occurred`,
          toaster: "b-toaster-bottom-right",
          variant: "danger"
        });
      }
      this.currentFile = null;
    },
    openChooseFileWindow(mtype) {
      document.getElementById(mtype).click();
    }
  }
};
</script>
<template>
  <b-container class="ffm w-100 h-100">
    <b-row class="ffm">
      <b-col md="4" class="ffm-navbar border-right">
        <div class="ffm-navbar-sticky-container h-100">
          <div class="ffm-navbar-sticky position-sticky pb-2 pt-2" :style="{top:0}">
            <div class="ffm-nav-bar-upload mb-1 mr-1">
              <modal-upload-and-crop-image
                variant="primary"
                content="<i class='fas fa-image'></i>"
                size="sm"
                stencil="rectangle"
                @uploadsuccess="uploadImageSuccess"
              />
              <b-button
                variant="info"
                size="sm"
                v-b-tooltip.hover
                title="Upload video"
                @click="openChooseFileWindow('inpVideo')"
              >
                <fa-icon :icon="['fas','video']" />
                <input
                  id="inpVideo"
                  type="file"
                  accept=".mov, .mp4"
                  hidden
                  ref="fileVideo"
                  @change="fileSelectChange"
                />
              </b-button>
              <b-button
                variant="success"
                size="sm"
                v-b-tooltip.hover
                title="Upload file âm thanh"
                @click="openChooseFileWindow('inpAudio')"
              >
                <fa-icon :icon="['fas','music']" />
                <input
                  id="inpAudio"
                  type="file"
                  accept=".aac, .aif, .aiff, .iff, .m3u, .mp3, .m4a, .mpa, .wma, .dac"
                  hidden
                  ref="fileAudio"
                  @change="fileSelectChange"
                />
              </b-button>
              <b-button
                size="sm"
                v-b-tooltip.hover
                title="Upload file khác"
                @click="openChooseFileWindow('inpApplication')"
              >
                <fa-icon :icon="['fas','file']" />
                <input
                  id="inpApplication"
                  type="file"
                  accept=".pdf, .docx, .pptx, .sql, .txt, .xlsx"
                  hidden
                  ref="fileApplication"
                  @change="fileSelectChange"
                />
              </b-button>
            </div>
            <div class="ffm-navbar-search mb-1 mr-1 w-100">
              <h6>Tìm kiếm</h6>
              <b-form class="mr-1">
                <b-input-group>
                  <template v-slot:prepend>
                    <b-input-group-text>
                      <i class="fas fa-search"></i>
                    </b-input-group-text>
                  </template>
                  <b-input id="inline-form-input-setting" placeholder="Tìm kiếm" v-model="q"></b-input>
                </b-input-group>
              </b-form>
            </div>
            <div class="ffm-navbar-filter">
              <h6>Lọc file theo</h6>
              <b-form inline>
                <b-form-select
                  v-model="file.filter.type.selected"
                  :options="file.filter.type.options"
                  @change="filterFileChange"
                  size="sm"
                  value-field="item"
                  class="mb-1 mr-1"
                ></b-form-select>
                <b-form-select
                  v-model="file.filter.size.selected"
                  :options="file.filter.size.options"
                  @change="filterFileChange"
                  size="sm"
                  value-field="item"
                  class="mb-1 mr-1"
                ></b-form-select>
                <b-form-select
                  v-model="file.filter.timestamp.selected"
                  :options="file.filter.timestamp.options"
                  @change="filterFileChange"
                  size="sm"
                  value-field="item"
                  class="mb-1 mr-1"
                ></b-form-select>
              </b-form>
            </div>
            <div class="ffm-navbar-odering">
              <h6>Sắp xếp theo</h6>
              <b-form inline>
                <b-form-select
                  v-model="file.ordering.selected"
                  :options="file.ordering.options"
                  :select-size="file.ordering.options.length"
                  @change="filterFileChange"
                  size="sm"
                  value-field="item"
                  class="mb-1 mr-1 w-100"
                ></b-form-select>
              </b-form>
            </div>
          </div>
        </div>
      </b-col>
      <b-col md="8" class="ffm-container">
        <b-overlay
          :show="loading.isLoading"
          rounded="sm"
          class="position-sticky pb-2 pt-2 m-0 bg-white w-100"
          :style="{top:0}"
        >
          <div class="ffm-container-menu">
            <b-button
              variant="light"
              size="sm"
              v-b-tooltip.hover
              title="Bỏ chọn"
              :disabled="!selectedItems.length"
              @click="deselectSelectedFiles"
            >
              <fa-icon :icon="['fas','minus-square']" />
            </b-button>
            <b-button variant="outline-primary" size="sm" :disabled="!selectedItems.length">
              Tải xuống&nbsp;
              <fa-icon :icon="['fas','download']" />
            </b-button>
            <b-button
              variant="outline-danger"
              size="sm"
              :disabled="!selectedItems.length"
              @click="deleteSelectedFiles"
            >
              Xoá&nbsp;
              <fa-icon :icon="['fas','trash-alt']" />
            </b-button>
          </div>
          <template v-slot:overlay>
            <div class="text-center">
              <fa-icon :icon="['fas','circle-notch']" class="fa-spin" />
              <span>{{loading.message}}</span>
            </div>
          </template>
        </b-overlay>
        <div class="ffm-container-select-area mt-1">
          <div class="files-layout">
            <file-item
              :key="index"
              v-for="(item, index) in file.data.results"
              :instance="item.data"
              :selected="item.selected"
              @click="handleClick(item)"
            />
            <!-- File /////-->
          </div>
          <infinite-loading :identifier="file.identifier" @infinite="infiniteHandler">
            <div slot="spinner">
              <bullet-list-loader :speed="2" class="w-100"></bullet-list-loader>
            </div>
            <div slot="no-more">
              <div class="d-none"></div>
            </div>
            <div slot="no-results">
              <list-empty></list-empty>
            </div>
          </infinite-loading>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>
<style lang="sass" scoped>

</style>