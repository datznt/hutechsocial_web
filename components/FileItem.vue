<script>
export default {
  name: "file-item",
  props: {
    instance: {
      type: Object,
      default: null
    },
    selected: {
      type: Boolean,
      default: false
    }
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
    reverseThumbnailUrl() {
      const thumbnailsLocation = _.get(
          this.instance,
          "thumbnails.location",
          null
        ),
        minSize = _.get(this.instance, "thumbnails.nodes[0]", null);
      if (thumbnailsLocation && minSize) {
        return thumbnailsLocation + minSize;
      }
      return null;
    },
    reverseFileSize() {
      const { size } = this.instance;
      return `${_.ceil(size / (1024 * 1024), 2)} MB`;
    },
    reverseUploadTime() {
      const { create_at } = this.instance;
      const d = new Date(create_at);
      return `${d.getDate()}/${d.getMonth() +
        1}/${d.getFullYear()} ${d.getHours()}h${d.getMinutes()}p`;
    }
  },
  methods: {
    handleClick() {
      this.$emit("click");
    }
  }
};
</script>
<template>
  <div
    v-if="instance"
    :class="['file-item d-flex justify-content-between mb-1',{'file-item--selected':selected}]"
    @click="handleClick"
  >
    <div
      class="file-item-preview clearfix d-flex justify-content-center align-items-center"
      :style="{width : '3rem'}"
    >
      <span
        v-if="['image','video'].includes(fileType)"
        :style="{maxHeight:'3rem',maxWidth:'3rem'}"
        class="overflow-hidden"
      >
        <b-img :src="reverseThumbnailUrl" :style="{height:'3rem',width:'3rem'}"></b-img>
      </span>
      <span v-else>
        <fa-icon :icon="['fas', reverseIcon]" class="fa-3x" />
      </span>
    </div>
    <div class="file-item-information w-100 pl-2">
      <p class="file-item-information--name mb-1 text-break">
        <b-link rel="noopener noreferrer" target="_blank" :href="instance.raw">{{instance.name}}</b-link>
      </p>
      <p class="file-item-information--detail text-muted pb-0">
        <span>{{reverseFileSize}} &#8226; {{reverseUploadTime}}</span>
      </p>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.file-item {
  padding: 0.25rem 0.5rem;
  background: #f7f7f7;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: 300ms;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.2);

  &:hover,
  &--selected {
    background: #28a74526;
  }
  &--selected {
    border: 1px solid #4550e6;
  }
}
</style>