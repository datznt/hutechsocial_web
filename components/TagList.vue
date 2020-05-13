<script>
export default {
  name: "tag-list",
  props: ["tags"],
  created() {
    this.CSS_COLORS = [
      "#444444",
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#92A8D1",
      "#F7CAC9",
      "#955251",
      "#B565A7",
      "#009B77",
      "#DD4124",
      "#D65076",
      "#45B8AC",
      "#EFC050",
      "#5B5EA6",
      "#9B2335",
      "#DFCFBE",
      "#55B4B0",
      "#7FCDCD",
      "#BC243C",
      "#C3447A",
      "#98B4D4"
    ];
  },
  methods: {
    radomColor() {
      return this.CSS_COLORS[
        Math.floor(Math.random() * this.CSS_COLORS.length)
      ];
    }
  }
};
</script>
<template>
  <div class="list-tags w-100 text-break">
    <a v-for="(item,i) in tags" :key="i" href="#" class="mt-1 mr-1 mb-1">
      <kbd :style="{'backgroundColor':radomColor()}">{{item.name}}</kbd>
    </a>
  </div>
</template>