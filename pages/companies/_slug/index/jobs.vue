<script>
import ListEmpty from "@/components/ListEmpty";
import JobItem from "@/components/JobItem";
import client from "@/services/client";
export default {
  components: {
    ListEmpty,
    JobItem
    // Places
  },
  props: ["instance", "role"],
  async asyncData({ params }) {
    try {
      const { data, status } = await client.job("get", {
        params_filter: {
          company__slug: params.slug
        }
      });
      return {
        job: {
          next: data.next,
          results: data.results
        }
      };
    } catch (err) {
      console.log(err);
    }
  },
  data: () => ({
    selected: null,
    options: [
      { value: null, text: "Phù hợp nhất" },
      { value: "a", text: "Mới nhất" }
    ],
    job: {
      next: null,
      results: []
    }
  }),
  created() {
    console.log(this.instance);
  }
};
</script>
<template>
  <div class="company-jobs-wrapper w-100">
    <b-card class="gedf-card card-no-effect">
      <h5>
        <span class="text-primary font-weight-bold">5439</span> việc làm phù hợp
      </h5>
      <div class="company-jobs-header mb-2">
        <div class="jobs-search-box">
          <b-input-group size="lg">
            <template v-slot:prepend>
              <b-input-group-text>
                <fa-icon :icon="['fas', 'search']" />
              </b-input-group-text>
            </template>
            <b-form-input placeholder="Tìm theo tên, mô tả" trim></b-form-input>
          </b-input-group>
        </div>
        <!-- <div class="jobs-ordering-box mr-2">
          <b-form-select v-model="selected" :options="options"></b-form-select>
        </div>-->
      </div>
      <div class="job-orders">
        <b-button pill variant="primary" size="sm">Phù hợp nhất</b-button>
        <b-button pill variant="outline-primary" size="sm">Mới nhất</b-button>
        <b-button pill variant="outline-primary" size="sm">Gần bạn</b-button>
        <!-- <b-button pill variant="outline-primary" size="sm"><fa-icon :icon="['fas','plus']" /> Thêm job mới</b-button> -->
      </div>
    </b-card>

    <div v-if="job.results.length" class="list-jobs">
      <job-item v-for="item in job.results" :key="item.id" :instance="item"></job-item>
    </div>
    <div v-else class="list-jobs-empty">
      <list-empty></list-empty>
    </div>
  </div>
</template>
<style lang="scss">
.gedf-card {
  &.card-no-effect {
    background-color: transparent;
    box-shadow: none;

    .card-body {
      padding: 0;
    }
  }
}
</style>