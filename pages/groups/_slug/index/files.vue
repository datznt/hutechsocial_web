<script>
import CardFile from "@/components/CardFile";
import client from "@/services/client";
import { InstagramLoader } from "vue-content-loader";
import ListEmpty from "@/components/ListEmpty";
export default {
  components: { CardFile, InstagramLoader,ListEmpty },
  props: ["instance", "role"],
  data: () => ({
    q: "",
    file: {
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
    }
  }),
  watch: {
    q: _.debounce(function() {
      this.filterFileChange(this.q);
    }, 500)
  },
  methods: {
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
      return condition;
    },
    async infiniteHandler($state) {
      if (!this.file.data.next) {
        $state.complete();
        return;
      }
      try {
        const condition = this.filterFileCondition();
        const { data } = await client.group("Filter files", {
          slug: this.instance.slug,
          url: this.file.data.next == "#" ? null : this.file.data.next,
          params_filter: condition
        });
        console.log(data);
        if (data.results.length) {
          Object.assign(this.file.data, {
            next: data.next,
            results: [...this.file.data.results, ...data.results]
          });
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
};
</script>
<template>
  <div class="files-wrapper">
    <div class="files-header">
      <b-card class="gedf-card" title="Ảnh và tập tin">
        <b-form inline>
          <b-input-group class="mb-2 mr-2">
            <template v-slot:prepend>
              <b-input-group-text>
                <i class="fas fa-search"></i>
              </b-input-group-text>
            </template>
            <b-input id="inline-form-input-setting" placeholder="Tìm kiếm" v-model="q"></b-input>
          </b-input-group>
        </b-form>
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
      </b-card>
    </div>
    <div class="files-list">
      <card-file :key="index" v-for="(item, index) in file.data.results" :instance="item" />
      <!-- File /////-->
      <infinite-loading :identifier="file.identifier" @infinite="infiniteHandler">
        <div slot="spinner">
          <b-card no-body class="gedf-card">
            <b-card-body>
              <instagram-loader :speed="2"></instagram-loader>
            </b-card-body>
          </b-card>
        </div>
        <div slot="no-results">
        <b-card no-body class="gedf-card">
          <b-card-body>
            <list-empty></list-empty>
          </b-card-body>
        </b-card>
      </div>
      </infinite-loading>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// .grid-item {
//   width: 30%;
// }
</style>