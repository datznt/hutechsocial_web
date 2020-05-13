<template>
  <div
    v-if="statusCode == 404"
    class="col-12 text-center d-flex align-items-center justify-content-center"
  >
    <div>
      <a href="/">
        <img class="img-fluid w-100" src="/images/404.svg" alt="404 not found" />
      </a>
      <h1 class="mt-5">
        Page not
        <span class="font-weight-bolder text-primary">found</span>
      </h1>
      <p class="lead my-4">Oops! {{ message }}.</p>
      <NuxtLink class="btn btn-primary animate-hover" to="/">
        <i class="fas fa-chevron-left mr-3 pl-2 animate-left-3"></i>Quay lại trang chủ
      </NuxtLink>
    </div>
  </div>
  <div v-else class="row" style="background:#fff">
    <div class="col-12 col-lg-6 order-2 order-lg-1 text-center text-lg-left">
      <h1 class="mt-5">
        Đã xảy ra 
        <span class="text-primary">lỗi</span> trong quá trình hoạt động
      </h1>
      <p
        class="lead my-4"
      >Vui lòng refesh lại trang hoặc liên hệ với chúng tôi nếu bạn tiếp tục gặp lỗi này.</p>
      <a class="btn btn-primary animate-hover" href="/">
        <i class="fas fa-chevron-left mr-3 pl-2 animate-left-3"></i>Quay lại trang chủ
      </a>
    </div>
    <div
      class="col-12 col-lg-6 order-1 order-lg-2 text-center d-flex align-items-center justify-content-center"
    >
      <img class="img-fluid w-75" src="/images/500.svg" alt="500 Server Error" />
    </div>
  </div>
</template>

<script>
export default {
  name: "NuxtError",
  props: {
    error: {
      type: Object,
      default: null
    },
    layout: "default"
  },
  computed: {
    statusCode() {
      return (this.error && this.error.statusCode) || 500;
    },
    message() {
      return this.error.message || "<%= messages.client_error %>";
    }
  }
};
</script>