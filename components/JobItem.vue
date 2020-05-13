<script>
import _ from "lodash";

export default {
  props: {
    instance: {
      type: Object,
      default: null
    },
    displayType: {
      type: String,
      default: "list-item"
    },
    styleClasses: {
      type: String,
      default: ""
    }
  },
  computed: {
    reverseCompanyInfo() {
      var _re = { banner: null, logo: null, name: null, href: null };
      _re["logo"] = _.get(this.instance, "company.logo.lazy_thumbnail_url");
      _re["banner"] = _.get(this.instance, "company.banner.lazy_thumbnail_url");
      _re["name"] = _.get(this.instance, "company.name");
      _re["href"] = `/companies/${_.get(this.instance, "company.slug")}/`;
      return _re;
    },
    reversePublisherInfo() {
      var _re = { name: null, href: null, email: null };
      _re["name"] = _.get(this.instance, "create_by.full_name");
      _re["href"] = `/users/${_.get(this.instance, "create_by.slug")}/`;
      _re["email"] = _.get(this.instance, "create_by.email");
      return _re;
    },
    reverseJobInfo() {
      var _re = { title: null, href: null, location: null };
      _re["title"] = _.get(this.instance, "title");
      _re["location"] = _.get(this.instance, "location_description.label");
      _re["industries"] = _.join(
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
      _re["experience_level"] = this.getLabelForExperienceLevel(
        _.get(this.instance, "experience_level")
      );
      _re["employment_type"] = this.getLabelEmploymentType(
        _.get(this.instance, "employment_type")
      );
      return _re;
    },
    reverseJobSkills() {
      return _.reduce(
        _.get(this.instance, "job_skills", []),
        (arr, item) => {
          if (this.isValidJobSkill(item)) {
            arr.push(item);
          }
          return arr;
        },
        []
      );
    },
    reverseJobLink() {
      return this.$router.resolve({
        name: "jobs-id",
        params: { id: this.instance.id }
      }).href;
    }
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
    },
    isValidJobSkill(jobSkill) {
      return (
        _.has(jobSkill, "skill.name") &&
        _.has(jobSkill, "id") &&
        _.has(jobSkill, "skill.description")
      );
    }
  }
};
</script>
<template>
  <b-card
    v-if="instance && displayType === 'list-item'"
    :class="['gedf-card card-job position-relative',styleClasses]"
  >
    <div class="job-item">
      <b-row>
        <b-col md="2" v-if="reverseCompanyInfo.logo">
          <b-avatar variant="light" rounded="sm" :src="reverseCompanyInfo.logo" size="4rem"></b-avatar>
        </b-col>
        <b-col>
          <div class="join-item-less-info-content-text">
            <nuxt-link :to="reverseJobLink" class="text-decoration-none">
              <h5 class="joib-item-name text-dark">{{reverseJobInfo.title}}</h5>
            </nuxt-link>
            <div class="join-item-less-info text-muted">
              <nuxt-link
                :to="reverseCompanyInfo.href"
                class="text-primary font-weight-bold"
              >{{reverseCompanyInfo.name}}</nuxt-link>
              <span>&#8226;</span>
              <span>
                <fa-icon :icon="['fas','map-marker-alt']" />
                {{reverseJobInfo.location}}
              </span>
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="2" v-if="reverseCompanyInfo.logo"></b-col>
        <b-col md="8">
          <b-row>
            <b-col md="6">
              <div class="d-flex h-100 text-dark">
                <div class="align-self-end">
                  <p class="text-muted fz-14 mb-0">Được tạo từ 8 ngày trước</p>
                  <div class="join-item-less-info-poster d-flex justify-content-start">
                    <div class="poster-info">
                      <p class="mb-0 font-weight-bold fz-14">
                        Liên hệ
                        <span class="text-primary">
                          <nuxt-link :to="reversePublisherInfo.href">{{reversePublisherInfo.name}}</nuxt-link>
                        </span>
                      </p>
                      <p
                        class="mb-0 font-weight-bold text-wrap fz-14"
                      >{{reversePublisherInfo.email}}</p>
                    </div>
                  </div>
                </div>
              </div>
            </b-col>
            <b-col md="6">
              <div class="h-100 d-flex text-dark">
                <div class="align-self-end">
                  <p class="mb-0 fz-14">
                    Seniority Level:
                    <span
                      class="font-weight-bold"
                    >{{reverseJobInfo.experience_level}}</span>
                  </p>
                  <p class="mb-0 fz-14">
                    Industry:
                    <span class="font-weight-bold">{{reverseJobInfo.industries}}</span>
                  </p>
                  <p class="mb-0 fz-14">
                    Employment Type:
                    <span
                      class="font-weight-bold"
                    >{{reverseJobInfo.employment_type}}</span>
                  </p>
                </div>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="w-100 mt-2" v-if="reverseJobSkills.length">
                <b-button
                  pill
                  variant="outline-secondary"
                  size="sm"
                  class="mr-1"
                  :id="'popover-reactive-' + item.id"
                  :key="i"
                  v-for="(item,i) in reverseJobSkills"
                >
                  {{item.skill.name}}
                  <b-popover
                    :target="'popover-reactive-' + item.id"
                    triggers="hover"
                    placement="auto"
                  >
                    <template v-slot:title>
                      <span>{{item.skill.name}}</span>
                    </template>
                    <div class="job-skill-popover">
                      <div class="job-skill-popover-description">
                        <span v-html="item.skill.description"></span>
                      </div>
                    </div>
                  </b-popover>
                </b-button>
              </div>
            </b-col>
          </b-row>
        </b-col>
        <b-col md="2">
          <div class="h-100 d-flex">
            <div class="align-self-end">
              <b-button variant="light" class="border text-nowrap some-size">
                Save &nbsp;
                <fa-icon :icon="['far','bookmark']" />
              </b-button>
              <b-button variant="light" class="border text-nowrap some-size mt-1">
                Apply
                <fa-icon :icon="['far','check-square']" />
              </b-button>
            </div>
          </div>
        </b-col>
      </b-row>
    </div>

    <div class="position-absolute" style="top:0;right:0">
      <b-dropdown
        variant="link"
        right
        toggle-class="text-decoration-none btn-link text-muted"
        no-caret
      >
        <template v-slot:button-content>
          <i class="fas fa-ellipsis-h"></i>
        </template>
        <b-dropdown-item href="#">Sao chép liên kết</b-dropdown-item>
        <b-dropdown-item href="#">Report</b-dropdown-item>
      </b-dropdown>
    </div>
  </b-card>
  <b-card
    v-else-if="instance && displayType == 'list-card'"
    :class="['gedf-card card-job position-relative',styleClasses]"
  >
    <div class="job-item">
      <div class="w-100" v-if="reverseCompanyInfo.logo">
        <b-avatar variant="light" rounded="sm" :src="reverseCompanyInfo.logo" size="4rem"></b-avatar>
      </div>
      <div class="join-item-less-info-content-text w-100">
        <nuxt-link :to="reverseJobLink" class="text-decoration-none">
          <h5 class="joib-item-name text-dark">{{reverseJobInfo.title}}</h5>
        </nuxt-link>
        <div class="join-item-less-info text-muted">
          <nuxt-link
            :to="reverseCompanyInfo.href"
            class="text-primary font-weight-bold"
          >{{reverseCompanyInfo.name}}</nuxt-link>
          <span>&#8226;</span>
          <span class="text-muted">{{reverseJobInfo.industries}}</span>
        </div>
      </div>
      <div class="w-100">
        <client-only>
          <small>
            &#8212;
            <timeago :datetime="instance.create_at" :auto-update="60"></timeago>
          </small>
        </client-only>
      </div>
    </div>
    <div class="position-absolute" style="top:0;right:0">
      <b-dropdown
        variant="link"
        right
        toggle-class="text-decoration-none btn-link text-muted"
        no-caret
      >
        <template v-slot:button-content>
          <i class="fas fa-ellipsis-h"></i>
        </template>
        <b-dropdown-item href="#">Sao chép liên kết</b-dropdown-item>
        <b-dropdown-item href="#">Report</b-dropdown-item>
      </b-dropdown>
    </div>
  </b-card>
  <div
    v-else-if="instance && displayType === 'list-item-less'"
    :class="['job-item','position-relative',styleClasses]"
    no-body
  >
    <div class="d-flex justify-content-start">
      <div class="company-logo">
        <b-avatar variant="light" rounded="sm" :src="reverseCompanyInfo.logo" size="3rem"></b-avatar>
      </div>

      <div class="job-information">
        <nuxt-link :to="reverseJobLink" class="text-decoration-none">
          <h6 class="joib-item-name text-dark mb-0">{{reverseJobInfo.title}}</h6>
        </nuxt-link>
        <small>
          <nuxt-link
            :to="reverseCompanyInfo.href"
            class="text-primary font-weight-bold"
          >{{reverseCompanyInfo.name}}</nuxt-link>
        </small>
        <div class="w-100">
          <client-only>
            <small>
              &#8212;
              <timeago :datetime="instance.create_at" :auto-update="60"></timeago>
            </small>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.fz-14 {
  font-size: 13px !important;
}
.gedf-card {
  &.card-job {
    .some-size {
      width: 5rem;
    }
    &--special {
      padding: 12px;
      height: 100%;
      max-height: 292px;
      margin: 0;
      border: 1px solid rgba(0, 0, 0, 0.125);
      box-shadow: none;
    }
  }
}
.job-item {
  &--listitem {
    box-shadow: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0;
    margin: 0;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>