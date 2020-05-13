<script>
export default {
  name: "card-file",
  props: {
    instance: {
      type: Object,
      default: null
    },
  },
  created() {
    this.SELF_TYPES = ["image", "video", "text", "audio", "application"];
  },
  computed: {
    fileType() {
      const mimetype = _.split(
        _.get(this.instance, "mimetype", "application/"),
        "/"
      );
      if (mimetype.length == 0) {
        return "application";
      }
      return mimetype[0];
    },
    reverseIcon() {
      if (this.fileType == "image") {
        return "image";
      } else if (this.fileType == "video") {
        return "video";
      } else if (this.fileType == "audio") {
        return "music";
      } else return "file";
    },
    reverseModalFileInfomationId() {
      return "modal-" + this.instance.id;
    },
    reverseInstanceToTableStacked() {
      const { name, size, mimetype, create_at } = this.instance;
      const d = new Date(create_at);
      return {
        name: name,
        size: `${_.ceil(size / (1024 * 1024), 2)} MB`,
        type: mimetype,
        timestamp: `${d.getDate()}/${d.getMonth() +
          1}/${d.getFullYear()} ${d.getHours()}h${d.getMinutes()}p`
      };
    }
  },
  methods: {}
};
</script>
<template>
  <b-card v-if="instance" no-body class="file-item gedf-card card--file" :id="instance.id">
    <!-- IMAGE -->
    <b-card-header>
      <div class="position-relative">
        <div class="d-flex justify-content-between align-items-center flex-wrap">
          <div class="d-flex justify-content-start align-items-center flex-wrap pb-2">
            <b-avatar :size="24" href="#foobar" variant="primary">
              <fa-icon :icon="['fas',reverseIcon]" />
            </b-avatar>
            <b-link class="ml-1" :href="instance.raw">{{instance.name}}</b-link>
          </div>
          <div class="tools">
            <b-dropdown
              :id="'gedf-dropdown_'+instance.id"
              variant="link"
              right
              toggle-class="text-decoration-none btn-link"
              no-caret
            >
              <template v-slot:button-content>
                <fa-icon :icon="['fas','ellipsis-v']" class="text-dark" />
              </template>
              <b-dropdown-item :href="instance.raw" download>
                <fa-icon :icon="['fas','cloud-download-alt']" />&nbsp;Tải xuống
              </b-dropdown-item>
              <b-dropdown-item v-b-modal="reverseModalFileInfomationId">
                <fa-icon :icon="['fas','info-circle']" />&nbsp;Chi tiết
              </b-dropdown-item>
            </b-dropdown>
            <b-modal :id="reverseModalFileInfomationId" centered hide-footer title="Thông tin file">
              <!-- <b-table stacked :items="reverseInstanceToTableStacked"></b-table> -->
              <b-table-simple borderless responsive>
                <b-tbody>
                  <b-tr>
                    <b-th>Tên file</b-th>
                    <b-td>{{reverseInstanceToTableStacked.name}}</b-td>
                  </b-tr>
                  <b-tr>
                    <b-th>Loại file</b-th>
                    <b-td>{{reverseInstanceToTableStacked.type}}</b-td>
                  </b-tr>
                  <b-tr>
                    <b-th>Kích thước</b-th>
                    <b-td>{{reverseInstanceToTableStacked.size}}</b-td>
                  </b-tr>
                  <b-tr>
                    <b-th>Ngày upload</b-th>
                    <b-td>{{reverseInstanceToTableStacked.timestamp}}</b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
            </b-modal>
          </div>
        </div>
      </div>
    </b-card-header>
    <b-card-body v-if="['image','video'].includes(fileType)">
      <!-- IMAGE -->
      <div v-if="fileType == 'image'" class="post-image">
        <b-img fluid :src="instance.lazy_thumbnail_url"></b-img>
      </div>
      <!-- VIDEO -->
      <div v-else-if="fileType == 'video'" class="post-image">
        <video width="100%" height="auto" controls :poster="instance.lazy_thumbnail_url">
          <source :src="instance.raw" :type="instance.mimetype" />
        </video>
      </div>
    </b-card-body>
    <b-card-body v-else-if="fileType == 'audio'">
      <!-- AUDIO -->
      <div class="w-100">
        <audio width="100%" height="auto" controls>
          <source :src="instance.raw" :type="instance.mimetype" />
        </audio>
      </div>
    </b-card-body>
  </b-card>
</template>
<style lang="scss" scoped>
.card--file {
  .card-header {
    background-color: transparent;
    border-bottom: unset;
  }
  .card-body {
    padding: 0;
    overflow: hidden;
  }
}
</style>