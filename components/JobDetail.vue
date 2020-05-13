<script>
import _ from "lodash";
import UserItem from "@/components/UserItem";
export default {
  name: "job-detail",
  components: { UserItem },
  props: {
    instance: {
      type: Object,
      default: null
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
  <div class="job-detail w-100">
    <div class="job-header d-flex justify-content-center">
      <div class="clearfix d-flex justify-content-between">
        <div class="company-logo">
          <b-avatar variant="light" rounded="sm" :src="reverseCompanyInfo.logo" size="10rem"></b-avatar>
        </div>
        <div class="job-info-less ml-2">
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
          <div class="posted-time">
            <client-only>
              <small>
                &#8212;
                <timeago :datetime="instance.create_at" :auto-update="60"></timeago>
              </small>
            </client-only>
          </div>
          <div class="job-buttons">
            <b-button variant="light" class="border text-nowrap some-size mt-1">
              Save &nbsp;
              <fa-icon :icon="['far','bookmark']" />
            </b-button>
            <b-button variant="light" class="border text-nowrap some-size mt-1">
              Apply
              <fa-icon :icon="['far','check-square']" />
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <div class="job-poster border-top pt-2 pb-2">
      <span class="text-muted">Tạo bởi</span>
      <!-- <user-item :instance="instance.create_by"></user-item> -->
    </div>
    <div class="job-information"></div>
  </div>
</template>