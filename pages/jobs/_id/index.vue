<script>
import client from "@/services/client";
import JobItem from "@/components/JobItem";
import UserItem from "@/components/UserItem";
import _ from "lodash";
export default {
  components: { JobItem, UserItem },
  validate({ params }) {
    return /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/.test(
      params.id
    );
  },
  async asyncData({ params }) {
    var qs = {};
    var { data } = await client.job("retrieve", {
      id: params.id
    });
    qs["instance"] = data;
    var { data } = await client.job("get", {
      params_filter: {
        industries__id: _.get(data, "industries[0].id")
      }
    });
    _.remove(data.results, j => j.id == qs["instance"].id);
    qs["subgetJobs"] = data.results;
    return qs;
  },
  data: () => ({
    title: null,
    instance: null,
    isLoading: false,
    subgetJobs: []
  }),
  computed: {
    reverseCompanyInfo() {
      var _re = {
        banner: null,
        logo: null,
        name: null,
        href: null,
        location: null
      };
      _re["logo"] = _.get(this.instance, "company.logo.lazy_thumbnail_url");
      _re["banner"] = _.get(
        this.instance,
        "company.banner.lazy_thumbnail_url",
        "/images/banner.png"
      );
      _re["name"] = _.get(this.instance, "company.name");
      _re["href"] = `/companies/${_.get(this.instance, "company.slug")}/`;
      _re["location"] = _.join(
        [
          _.get(this.instance, "company.address.state", null),
          _.get(this.instance, "company.address.country", null)
        ],
        ", "
      );
      return _re;
    },
    reverseIndustries() {
      return _.join(
        _.reduce(
          _.get(this.instance, "industries", []),
          (arr, i) => {
            arr.push(i.name);
            return arr;
          },
          []
        ),
        ", "
      );
    },
    isSplit() {
      return this.subgetJobs.length > 0;
    }
  },
  created() {
    console.log(this.instance.create_by);
  },
  methods: {
    getLabelForExperienceLevel(key) {
      if (key == "internship") {
        return "Internship";
      } else if (key == "entry_level") {
        return "Entry level";
      } else if (key == "associate") {
        return "Associate";
      } else if (key == "mid_senior_level") {
        return "Mid-Senior level";
      } else if (key == "director") {
        return "Director";
      } else if (key == "executive") {
        return "Not applicable";
      } else {
        return "";
      }
    },
    getLabelEmploymentType(key) {
      if (key == "full_time") {
        return "Full-time";
      } else if (key == "part_time") {
        return "Part-time";
      } else if (key == "contract") {
        return "Contract";
      } else if (key == "temporary") {
        return "Temporary";
      } else if (key == "volunteer") {
        return "Volunteer";
      } else if (key == "internship") {
        return "Internship";
      } else {
        return "";
      }
    }
  }
};
</script>
<template>
  <b-row class="page-company" v-if="instance">
    <b-col :md="isSplit ? 8 : 12">
      <b-card class="gedf-card" no-body>
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
          <div class="d-flex justify-content-between align-items-center pt-3 pb-3">
            <div class="clearfix w-100">
              <div class="d-flex justify-content-between position-relative">
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
              <div class="mt-3 w-100">
                <h4>{{instance.title}}</h4>
                <div class="d-flex justify-content-between align-items-center flex-wrap w-100">
                  <div class="info-area">
                    <span class="text-muted d-block">
                      <nuxt-link
                        :to="reverseCompanyInfo.href"
                        class="font-weight-bold"
                      >{{reverseCompanyInfo.name}}</nuxt-link>
                      &#8226; {{reverseCompanyInfo.location}}
                    </span>
                    <span class="text-muted d-block">
                      <client-only>
                        <small>
                          &#8212;
                          <timeago :datetime="instance.create_at" :auto-update="60"></timeago>
                        </small>
                      </client-only>
                    </span>
                  </div>
                  <div class="apply-area">
                    <b-button variant="primary">ỨNG TUYỂN</b-button>
                    <b-button variant="outline-info">LƯU</b-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="align-self-start">
              <b-dropdown
                id="dropdown-1"
                variant="link"
                right
                toggle-class="text-secondary"
                no-caret
              >
                <template v-slot:button-content>
                  <fa-icon :icon="['fas', 'ellipsis-v']" />
                </template>
                <b-dropdown-item>Chia sẻ</b-dropdown-item>
                <b-dropdown-item>Lấy liên kết</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
          <div class="job-detail pt-3 pb-3 border-top">
            <b-row>
              <b-col md="8">
                <h6>Mô tả công việc:</h6>
                <span v-html="$sanitize(instance.description)"></span>
                <h6>Yêu cầu:</h6>
                <span v-html="$sanitize(instance.requirement)"></span>
              </b-col>
              <b-col md="4">
                <div class="pb-3">
                  <h6>Kỹ năng</h6>
                  <ul class="m-0 p-0 list-unstyled">
                    <li v-for="item in instance.job_skills" :key="item.id">
                      <span>
                        <fa-icon :icon="['far','check-circle']" class="text-info" />
                        {{_.get(item,'skill.name')}}
                      </span>
                    </li>
                  </ul>
                </div>
                <div class="border-top pt-3 pb-3">
                  <h6 class="text-muted mb-3">Chi tiết yêu cầu</h6>
                  <div class="mb-2">
                    <h6 class="mb-1">Seniority Level</h6>
                    <span>{{getLabelForExperienceLevel(instance.experience_level)}}</span>
                  </div>
                  <div class="mb-2">
                    <h6 class="mb-1">Employment Type</h6>
                    <span>{{getLabelEmploymentType(instance.employment_type)}}</span>
                  </div>
                  <div class="mb-2">
                    <h6 class="mb-1">Industry</h6>
                    <span>{{reverseIndustries}}</span>
                  </div>
                </div>
              </b-col>
            </b-row>
          </div>
        </b-card-body>
      </b-card>
    </b-col>
    <b-col :md="isSplit ? 4 : 12 ">
      <b-card class="gedf-card">
        <h6>Công việc tương tự</h6>
        <ul class="list-jobs--listitem list-unstyled m-0">
          <li class="list-jobs--listitem-item" :key="i" v-for="(item,i) in subgetJobs">
            <job-item
              :instance="item"
              displayType="list-item-less"
              styleClasses="job-item--listitem"
            ></job-item>
          </li>
        </ul>
      </b-card>
    </b-col>
  </b-row>
</template>