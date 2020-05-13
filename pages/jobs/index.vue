<script>
import client from "@/services/client";
import JobItem from "@/components/JobItem";
export default {
  components: { JobItem },
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
  <b-row class="page-jobs">
    <b-col md="12">
      <b-row>
        <b-col>
          <b-card class="gedf-card card-search-job">
            <div class="company-jobs-header d-flex justify-content-center align-self-center">
              <div>
                <h2 class="text-dark">Tìm kiếm công việc mơ ước</h2>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="lef d-flex">
                    <b-input-group size="lg" class="mr-2" variant="primary">
                      <template v-slot:prepend>
                        <b-input-group-text class="bg-white">
                          <fa-icon :icon="['fas', 'search']" />
                        </b-input-group-text>
                      </template>
                      <b-form-input placeholder="Tìm theo tên, mô tả" trim></b-form-input>
                    </b-input-group>

                    <b-input-group size="lg" class="mr-2">
                      <template v-slot:prepend>
                        <b-input-group-text class="bg-white">
                          <fa-icon :icon="['fas', 'map-marker-alt']" />
                        </b-input-group-text>
                      </template>
                      <b-form-input placeholder="Thành phố, mã bưu điện" trim></b-form-input>
                    </b-input-group>
                  </div>
                  <div class>
                    <b-button variant="primary" size="lg">Tìm kiếm</b-button>
                  </div>
                </div>
                <h5 class="mt-4 text-dark">Đề xuất tìm kiếm việc làm</h5>
                <div class="job-orders mt-2">
                  <b-button pill variant="outline-info" size="sm">C#</b-button>
                  <b-button pill variant="outline-info" size="sm">Java</b-button>
                  <b-button pill variant="outline-info" size="sm">Javascript</b-button>
                </div>
              </div>
            </div>
            <div class="bg"></div>
          </b-card>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card class="gedf-card card-search-job">
            <h5>Gợi ý từ hồ sơ của bạn</h5>
            <div class="list-jobs-wrapper">
              <ul class="list-jobs--card">
                <li class="list-jobs--card-item--card" :key="i" v-for="(item,i) in job.results">
                  <job-item
                    :instance="item"
                    displayType="list-card"
                    styleClasses="card-job--special"
                  ></job-item>
                </li>
              </ul>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>
<style lang="scss">
.gedf-card {
  &.card-no-effect {
    // background-color: transparent;

    // .card-body {
    //   padding: 0;
    //   background-color: transparent !important;
    // }
  }
  &.card-search-job {
    position: relative;
    .company-jobs-header {
      & > div {
        z-index: 2;
      }
    }
    .bg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0px;
      left: 0px;
      //   background: url(/images/job-bg.jfif);
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      background-color: rgba($color: #ffffff, $alpha: 1);
      filter: blur(1px);
      z-index: 1;
    }
    .list-jobs--card {
      list-style-type: none;
      display: flex;
      justify-content: flex-start;
      flex-flow: row wrap;
      padding: 0;
      margin: 0;
      &-item--card {
        max-width: 260px;
        min-width: 180px;
        width: 100%;
        flex: 1 1 30%;
        margin: 0.25rem;
      }
    }
  }
}
</style>