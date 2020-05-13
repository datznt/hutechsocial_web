<template>
  <b-avatar variant="light" rounded="sm" :src="src" :size="size" ></b-avatar>
</template>
<script>
export default {
  name: "rounde-avatar",
  data() {
    return {
      // text: null,
      // color: null,
      // background: "#000"
    };
  },
  props: {
    defaultSource: String,
    source: [Object,String],
    setSize: String
  },
  computed: {
    src() {
      let _src = "";
      if (!this.source) {
        return this.defaultSource || "";
      }
      if (this.source instanceof String) {
        return this.source
      }
      if (!!this.source.thumbnails) {
        _src = this.source.thumbnails.location + this.source.thumbnails.nodes[0];
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