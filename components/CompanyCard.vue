<script>
export default {
  name: "company-card",
  props: ["instance"],
  computed: {
    reverseCompanyInfo() {
      var _re = {
        banner: null,
        logo: null,
        name: null,
        href: null,
        location: null
      };
      _re["logo"] = _.get(this.instance, "logo.lazy_thumbnail_url");
      _re["banner"] = _.get(
        this.instance,
        "banner.lazy_thumbnail_url",
        "/images/banner.png"
      );
      _re["name"] = _.get(this.instance, "name");
      _re["href"] = `/companies/${_.get(this.instance, "slug")}/`;
      return _re;
    }
  },
  created() {}
};
</script>
<template>
  <b-card v-if="instance" class="gedf-card" no-body>
    <b-card-header header-tag="div" class="p-0 border-0 bg-light overflow-hidden">
      <div class="banner-transition" :style="{maxHeight: '6rem', height: '6rem'}">
        <b-img
          fluid
          :src="reverseCompanyInfo.banner"
          alt="Transparent image"
          blank-color="#88f"
          class="w-100"
        ></b-img>
      </div>
    </b-card-header>
    <b-card-body>
      <div class="pt-3 pb-3 w-100">
        <div class="clearfix w-100">
          <div class="d-flex justify-content-center position-relative">
            <div class="position-absolute" style="top:-4rem;">
              <b-avatar
                rounded
                :src="reverseCompanyInfo.logo"
                variant="light"
                size="4rem"
                class="border shadow-sm avatar--logo"
              ></b-avatar>
            </div>
          </div>
          <div class="mt-3 w-100 text-center">
            <h4><nuxt-link
              :to="reverseCompanyInfo.href"
              class="font-weight-bold"
            >{{reverseCompanyInfo.name}}</nuxt-link></h4>
          </div>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>