<template>
  <b-avatar variant="primary" :src="src" :size="size" badge-variant="light">
    <template v-if="showIcon" v-slot:badge>
      <slot></slot>
    </template>
  </b-avatar>
</template>
<script>
export default {
  name: "cricle-avatar",
  data() {
    return {
      // text: null,
      // color: null,
      // background: "#000"
    };
  },
  props: {
    defaultSource: String,
    source: [Object, String],
    setSize: String,
    showIcon:{
      type: Boolean,
      default : false
    }
  },
  computed: {
    src() {
      let _src = "";
      if (!this.source) {
        return this.defaultSource || "";
      }
      if (this.source instanceof String) {
        return this.source;
      }
      if (!!this.source.thumbnails) {
        _src =
          this.source.thumbnails.location + this.source.thumbnails.nodes[0];
      }
      return _src;
    },
    size() {
      let _size = this.setSize || "36";
      return `${_size}px`;
    }
  }
};
</script>