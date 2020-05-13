<script>
export default {
  props: ["instance", "role"],
  computed: {
    reverseCompanyType() {
      const type = _.get(this.instance, "company_type", null);
      if (!type) {
        return null;
      } else if (type == "PC") {
        //   Public Company
        return "Public Company";
      } else if (type == "SE") {
        //   Selft Employed
        return "Selft Employed";
      } else if (type == "GA") {
        //   Goverment Agency
        return "Goverment Agency";
      } else if (type == "NR") {
        //   NonProfit
        return "NonProfit";
      } else if (type == "PH") {
        //   Privately Held
        return "Privately Held";
      } else if (type == "PR") {
        //   Partnership
        return "Partnership";
      } else {
        return null;
      }
    },
    reverseIndustryName(){
      return _.get(this.instance,'industry.name')
    },
    reverseAddress(){
      return _.get(this.instance,'address.label')
    }
  }
};
</script>
<template>
  <div class="company-about-wrapper w-100">
    <b-card class="gedf-card" title="Giới thiệu">
      <b-card-text v-html="instance.overview"></b-card-text>
      <div class="card-table">
        <b-table-simple borderless responsive>
          <b-tbody>
            <b-tr>
              <b-th>Website</b-th>
              <b-td>
                <b-link
                  :href="instance.site_url"
                  rel="noopener noreferrer"
                  target="_blank"
                >{{instance.site_url}}</b-link>
              </b-td>
            </b-tr>
            <b-tr v-if="reverseIndustryName">
              <b-th>Lĩnh vực</b-th>
              <b-td>{{reverseIndustryName}}</b-td>
            </b-tr>
            <b-tr>
              <b-th>Loại cty</b-th>
              <b-td>{{reverseCompanyType}}</b-td>
            </b-tr>
            <b-tr>
              <b-th>Thành lập</b-th>
              <b-td>{{instance.founded}}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>
    </b-card>
  </div>
</template>