<script>
import client from "@/services/client";
import JobItem from "@/components/JobItem";
import JobDetail from "@/components/JobDetail";
import { ContentLoader } from "vue-content-loader";
export default {
  components: { ContentLoader, JobItem, JobDetail },
  async asyncData({ params }) {
    try {
      const { data, status } = await client.job("get", {});
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
    job: {
      next: null,
      results: []
    }
  })
};
</script>
<template>
  <b-row class="page-search-jobs h-100">
    <b-col>
      <client-only>
        <b-card class="gedf-card vh-100">
          <b-row class="h-100">
            <b-col md="4" class="border-right mh-100 overflow-auto">
              <ul class="list-jobs--listitem">
                <li class="list-jobs--listitem-item" :key="i" v-for="(item,i) in job.results">
                  <job-item
                    :instance="item"
                    displayType="list-item-less"
                    styleClasses="job-item--listitem"
                  ></job-item>
                </li>
              </ul>
            </b-col>
            <b-col md="8">
                <job-detail :instance="job.results[1]"></job-detail>
            </b-col>
          </b-row>
        </b-card>
      </client-only>
    </b-col>
  </b-row>
</template>
<style lang="scss" scoped>
.list-jobs--listitem {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
</style>