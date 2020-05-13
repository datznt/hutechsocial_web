<template>
  <div>
    <h1>hello</h1>
    <h4>{{params}}</h4>
  </div>
</template>
<script>
export default {
  data() {
    return {
      params: null
    };
  },
  created(){
      this.params = this.$route.params;
  }
};
</script>