<script>
import UserItem from "@/components/UserItem";
import TagList from "@/components/TagList";
import client from "@/services/client";
import { mapState } from "vuex";
import _ from "lodash";

export default {
  // scrollToTop: true,
  auth: false,
  components: {
    UserItem,
    TagList
  },
  validate({ params }) {
    return /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(params.slug);
  },
  head() {
    const { title, slogan, image } = this;
    return {
      title: title,
      slogan: slogan,
      meta: [
        {
          hid: "description",
          name: "description",
          content: slogan
        },
        {
          hid: "image",
          name: "image",
          content: image
        }
      ]
    };
  },
  async asyncData({ params, error }) {
    try {
      const { data } = await client.company("retrieve", {
        slug: params.slug
      });
      return {
        instance: data
      };
    } catch (err) {
      error({
        statusCode: 404,
        message: "Công ty này không tồn tại!"
      });
    }
  },
  data: () => ({
    title: "",
    slogan: "",
    image: "",
    instance: null,
    root: "/companies/",
    isFollow: {
      status: false,
      follow_id: "",
      loading: false
    },
    isFullBanner: false,
    navbar: [
      {
        pageName: "index",
        href: "#index",
        htmlContent: "<span>Trang chủ</span>"
      },
      {
        pageName: "about",
        href: "#about",
        htmlContent: "<span>Giới thiệu</span>"
      },
      {
        pageName: "videos",
        href: "#videos",
        htmlContent: "<span>Video</span>"
      },
      {
        pageName: "jobs",
        href: "#jobs",
        htmlContent: "<span>Công việc</span>"
      },
      {
        pageName: "contact",
        href: "#contact",
        htmlContent: "<span>Liên hệ</span>"
      }
    ]
  }),
  computed: {
    ...mapState({
      socketMessage: state => state.socket.message,
      socketState: state => state.socket.isConnected
    }),
    reverseBanner() {
      const lazy = _.get(this.instance, "banner.lazy_thumbnail_url", null);
      if (lazy) {
        return lazy;
      }
      return "/images/banner.png";
    },
    reverseLogo() {
      const lazy = _.get(this.instance, "logo.lazy_thumbnail_url", null);
      if (lazy) {
        return lazy;
      }
      return "https://assets-ouch.icons8.com/preview/329/9e58b949-f9d6-4cad-8efc-4e763ac94665.png";
    },
    reverseName() {
      return _.get(this.instance, "name", null);
    },
    reverseSlogan() {
      return _.get(this.instance, "slogan", null);
    },
    role() {
      let createById = null,
        localUserId = _.get(this.$auth, "user.id", null);
      if (this.instance.create_by instanceof String) {
        createById = this.instance.create_by;
      } else if (this.instance.create_by instanceof Object) {
        createById = _.get(this.instance, "create_by.id", null);
      }
      if (!createById) {
        // guest
        return this.ROLE_CHOICES[1];
      }
      // check owner
      return localUserId == createById
        ? this.ROLE_CHOICES[0]
        : this.ROLE_CHOICES[1];
    }
  },
  watch: {
    socketMessage(msg) {
      if (
        _.has(msg, "payload.affect.object") &&
        _.has(msg, "payload.affect.node")
      ) {
        if (msg.payload.affect.object == "group_user") {
          this.updateMemberInfomation(msg.payload.affect.node);
        }
      }
    }
  },
  created() {
    /*DEFINE CONSTANTS*/
    this.ROLE_CHOICES = ["owner", "guest"];
    // this.getCompanyInfo();
    this.renderUserInterface();
  },
  methods: {
    async getCompanyInfo() {
      try {
        const { data } = await client.company("retrieve", {
          slug: this.$route.params.slug
        });
        this.instance = data;
        console.log(data);
        this.renderUserInterface();
      } catch (err) {
        console.log(err);
        this.$nuxt.error({
          statusCode: 404,
          message: "Công ty này không tồn tại!"
        });
      }
    },
    renderUserInterface() {
      if (!this.instance) {
        return;
      }
      // seo
      this.title = this.instance.name;
      this.slogan = this.instance.slogan;
      this.image = _.get(this.instance, "banner.lazy_thumbnail_url");
      this.root += this.instance.slug + "/";

      if (_.has(this.instance, "my_info.id")) {
        _.assign(this.isJoinGroup, this.instance.my_info);
      }

      if (_.has(this.instance, "my_follow.id")) {
        this.isFollow.status = true;
        this.isFollow.follow_id = this.instance.my_follow.id;
      }

      _.forEach(this.navbar, (item, i) => {
        if (item.pageName == "index") {
          item.href = this.root;
        } else {
          item.href = this.root + item.pageName + "/";
        }
      });
    },
    async followProcess() {
      this.isFollow.loading = true;
      if (!this.$auth.loggedIn) {
        this.$router.push("/login/");
        return;
      }
      try {
        if (this.isFollow.status) {
          // unfollow
          const { status } = await client.follow("delete", {
            follow_id: this.isFollow.follow_id
          });
          this.isFollow.status = false;
        } else {
          // follow
          const { data, status } = await client.follow("create", {
            content_type: "company",
            object_id: this.instance.id,
            create_by: _.get(this.$auth,'user.id')
          });
          this.isFollow.follow_id = data.id;
          this.isFollow.status = true;
        }
      } catch (err) {
        console.error(err);
      }
      this.isFollow.loading = false;
    }
  }
};
</script>
<template>
  <b-row class="page-company" v-if="instance">
    <b-col>
      <b-row class="page-company-header">
        <b-col>
          <b-card class="gedf-card" no-body>
            <b-card-header header-tag="div" class="p-0 border-0 bg-light overflow-hidden ">
              <div class="banner-transition" :style="{maxHeight: '10rem'}">
                <b-img
                  fluid
                  :src="reverseBanner"
                  alt="Transparent image"
                  blank-color="#88f"
                  class="w-100"
                ></b-img>
              </div>
            </b-card-header>
            <b-card-body>
              <div class="d-flex justify-content-between align-items-center">
                <div class="clearfix">
                  <div class="d-flex justify-content-between position-relative">
                    <div class="position-absolute" style="top:-4rem;">
                      <b-avatar
                        rounded
                        :src="reverseLogo"
                        variant="light"
                        size="8rem"
                        class="border avatar--logo"
                      ></b-avatar>
                    </div>
                    <div style="margin-left:8rem" class="pl-2">
                      <h4>{{reverseName}}</h4>
                      <span class="text-muted">{{instance.industry.name}} &#8226; {{reverseSlogan}}</span>
                    </div>
                  </div>
                  <div class="mt-3">
                    <b-overlay
                      :show="isFollow.loading"
                      rounded
                      opacity="0.9"
                      spinner-small
                      spinner-variant="primary"
                      class="d-inline-block"
                    >
                      <b-button variant="primary" size="sm" @click="followProcess">
                        <fa-icon :icon="['fas', isFollow.status ? 'check' : 'plus']" />&nbsp;Theo dõi
                      </b-button>
                    </b-overlay>
                    <b-button
                      variant="outline-info"
                      size="sm"
                      :href="instance.site_url"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Vào trang web&nbsp;
                      <fa-icon :icon="['fas','external-link-alt']" />
                    </b-button>
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
                    <b-dropdown-divider></b-dropdown-divider>
                    <client-only>
                      <b-dropdown-item to="../manager" v-if="role == ROLE_CHOICES[0]">Trang quản lý</b-dropdown-item>
                    </client-only>
                  </b-dropdown>
                </div>
              </div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
      <b-row class="page-company-body">
        <b-col md="3" class="page-company-body-navbar">
          <div class="group-navbar-wrapper">
            <b-card no-body class="gedf-card card-group-link">
              <b-list-group flush>
                <b-list-group-item
                  v-for="(item,i) in navbar"
                  v-html="item.htmlContent"
                  :key="i"
                  :active="$route.path == item.href"
                  :to="item.href"
                ></b-list-group-item>
              </b-list-group>
            </b-card>
          </div>
        </b-col>
        <b-col md="9" class="page-company-body-content">
          <NuxtChild :instance="instance" :role="role" />
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>
<style lang="scss">
.avatar--logo {
  img {
    width: 100%;
    height: 100%;
  }
}
</style>