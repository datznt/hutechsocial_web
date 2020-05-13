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
    var { title, description } = this;
    return {
      title: title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: title,
          content: description
        }
      ]
    };
  },
  data() {
    return {
      title: "Aj",
      description: "",
      instance: null,
      root: "/groups/",
      isFollow: {
        status: false,
        follow_id: "",
        loading: false
      },
      isJoinGroup: {
        loading: false,
        id: "",
        user_accepted: false,
        admin_accepted: false,
        is_admin: false
      },
      listAdmin: {
        count: 0,
        results: []
      },
      offset: { top: 80, bottom: 0 },
      navbar: [
        {
          pageName: "index",
          href: "#index",
          htmlContent: '<span><i class="fas fa-rss-square"></i> Bài viết</span>'
        },
        {
          pageName: "members",
          href: "#members",
          htmlContent: '<span> <i class="fas fa-users"></i> Thành viên </span>'
        },
        {
          pageName: "files",
          href: "#files",
          htmlContent:
            '<span> <i class="fas fa-photo-video"></i> Ảnh và tập tin </span>'
        },
        {
          pageName: "moderate",
          href: "#invited",
          htmlContent:
            '<span> <i class="fas fa-tasks"></i> Kiểm duyệt nhóm </span>'
        },
        {
          pageName: "setting",
          href: "#setting",
          htmlContent: '<span> <i class="fas fa-cog"></i> Cài đặt nhóm </span>'
        },
        {
          pageName: "history",
          href: "#history",
          htmlContent: '<span> <i class="fas fa-history"></i> Lịch sử </span>'
        }
      ]
    };
  },
  computed: {
    ...mapState({
      socketMessage: state => state.socket.message,
      socketState: state => state.socket.isConnected,
      isFullContainer: state => state.layout.isFullContainer
    }),
    verboseDate() {
      const d = new Date(this.instance.create_at);
      return `${d.getDate()} tháng ${d.getMonth()}, ${d.getFullYear()}`;
    },
    role() {
      /*
          ROLE ["admin","member","none","request"]
      */
      const { id, user_accepted, admin_accepted, is_admin } = this.isJoinGroup;
      if (user_accepted && admin_accepted && is_admin) {
        return this.ROLE_CHOICES[0];
      }
      if (user_accepted && admin_accepted && !is_admin) {
        return this.ROLE_CHOICES[1];
      }
      if (user_accepted && !admin_accepted) {
        return this.ROLE_CHOICES[3];
      }
      if (!user_accepted && id) {
        return this.ROLE_CHOICES[4];
      }
      return this.ROLE_CHOICES[2];
    },
    verboseRole() {
      const role = this.role;
      if (this.SAFE_ROLES.includes(role)) {
        return role == this.SAFE_ROLES[0] ? "Quản trị viên" : "Thành viên";
      }
      return "Không rõ";
    },
    bannerReverse() {
      if (_.has(this.instance, "banner.lazy_thumbnail_url")) {
        return this.instance.banner.lazy_thumbnail_url;
      }
      return "https://assets-ouch.icons8.com/free-download/781/61f24427-f2dd-4ef8-8b50-4881e1ca5c69.png?filename=pablo-coming-soon.png";
    },
    pagesWithRole() {
      /*
          ROLE ["admin", "member", "none", "request", "waiting"]
      */
      var unself = [];
      if (this.role == this.SAFE_ROLES[1]) {
        unself.push("setting");
        const oneOrTwo = [
          _.get(this.instance, "setting.can_approve_members", "only_admin"),
          _.get(this.instance, "setting.can_approve_posts", "only_admin")
        ];
        if (this.role == this.SAFE_ROLES[1] && !oneOrTwo.includes("anyone")) {
          unself.push("moderate");
        }
      }
      return _.reduce(
        this.navbar,
        (pages, p) => {
          if (!unself.includes(p.pageName)) {
            pages.push(p);
          }
          return pages;
        },
        []
      );
    },
    reverseParentName(){
      return _.get(this.instance,'parent.name',null);
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
  async asyncData({ params, error }) {
    try {
      const { data } = await client.group("retrieve", {
        slug: params.slug
      });
      return {
        instance: data
      };
    } catch (err) {
      error({ statusCode: 404, message: "Nhóm này không tồn tại!" });
    }
  },
  created() {
    /*DEFINE CONSTANTS*/
    this.ROLE_CHOICES = ["admin", "member", "none", "request", "waiting"];
    this.SAFE_ROLES = [this.ROLE_CHOICES[0], this.ROLE_CHOICES[1]];
    this.renderUserInterface();
    // this.getGroupInfo();
  },
  methods: {
    async getGroupInfo() {
      try {
        const { data } = await client.group("retrieve", {
          slug: this.$route.params.slug
        });
        this.instance = data;
        this.renderUserInterface();
      } catch (err) {
        console.log(err);
        this.$nuxt.error({
          statusCode: 404,
          message: "Nhóm này không tồn tại!"
        });
      }
    },
    renderUserInterface() {
      if (!this.instance) {
        return;
      }
      this.title = this.instance.name;
      this.description = this.instance.description;
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
      if (this.isFollow.status) {
        // unfollow
        await client
          .follow("delete", { follow_id: this.isFollow.follow_id })
          .then(resp => {
            this.isFollow.status = false;
            this.isFollow.loading = false;
          })
          .catch(err => {
            console.error(err);
            this.isFollow.loading = false;
          });
      } else {
        // follow
        await client
          .follow("create", {
            content_type: "group",
            object_id: this.instance.id,
            create_by: _.get(this.$auth,'user.id')
          })
          .then(resp => {
            this.isFollow.follow_id = resp.data.id;
            this.isFollow.status = true;
            this.isFollow.loading = false;
          })
          .catch(err => {
            console.error(err);
            this.isFollow.loading = false;
          });
      }
    },
    async joinGroup() {
      this.isJoinGroup.loading = true;
      if (!this.$auth.loggedIn) {
        this.$router.push("/login/");
        return;
      }
      try {
        if (this.role == "none") {
          const { data } = await client.group("Join the group", {
            user_id: this.$auth.user.id,
            group_id: this.instance.id
          });
          _.assign(this.isJoinGroup, data);
        } else if (["member", "admin", "request"].includes(this.role)) {
          const resp = await client.group("Leave group", {
            group_user_id: this.isJoinGroup.id
          });
          _.assign(this.isJoinGroup, {
            id: "",
            user_accepted: false,
            admin_accepted: false
          });
        } else if (this.role == "waiting") {
          const { data } = await client.group("Accept the invitation", {
            group_user_id: this.isJoinGroup.id
          });
          _.assign(this.isJoinGroup, data);
        }
      } catch (err) {
        this.$bvToast.toast(err.toString(), {
          title: `Đã có lỗi xảy ra!`,
          toaster: "b-toaster-bottom-right",
          variant: "danger"
        });
      }
      this.isJoinGroup.loading = false;
    },
    async updateMemberInfomation(group_user_id) {
      try {
        const { data } = await client.group("Get member information", {
          group_user_id: group_user_id
        });
        if (data.group == this.instance.id && data.user == this.$auth.user.id) {
          _.assign(this.isJoinGroup, data);
        }
      } catch (error) {
        console.log(error);
      }
    },
    handlingGroupPage(page) {
      if (page.pageName == "files") {
        this.$store.commit("setFullContainer", true);
      }
    }
  }
};
</script>
<template>
  <b-row class="page-group" v-if="instance">
    <b-col md="4" class="group-navbar">
      <!-- <div v-sticky sticky-offset="offset" class="group-navbar-wrapper"> -->
      <div class="group-navbar-wrapper position-sticky" style="top:80px">
        <b-card no-body class="gedf-card group-cards-info">
          <b-card-body>
            <h3>{{instance.name}}</h3>
            <div v-if="SAFE_ROLES.includes(role)" class="group-cards-info-cureent-user">
              <p>
                Bạn là
                <kbd>{{ verboseRole }}</kbd>
              </p>
              <b-button-group size="sm">
                <b-overlay
                  :show="isFollow.loading"
                  rounded
                  opacity="0.9"
                  spinner-small
                  spinner-variant="primary"
                  class="float-right"
                >
                  <b-button variant="light" size="sm" @click="followProcess">
                    <span v-if="isFollow.status">
                      <fa-icon :icon="['fas','check']" class="text-primary" />
                    </span>
                    Theo dõi
                  </b-button>
                </b-overlay>
                <b-button variant="light" size="sm">Chia sẻ</b-button>
              </b-button-group>
            </div>
            <div v-else class="mt-2">
              <b-overlay
                :show="isJoinGroup.loading"
                rounded
                opacity="0.9"
                spinner-small
                spinner-variant="primary"
              >
                <b-button class="w-100" variant="primary" size="sm" @click="joinGroup()">
                  <div>
                    <span v-if="role === ROLE_CHOICES[2]">
                      <fa-icon :icon="['fas','plus']" />Tham gia nhóm
                    </span>
                    <span v-else-if="role === ROLE_CHOICES[4]">
                      <fa-icon :icon="['fas','hands-wash']" />Chấp nhận lời mời
                    </span>
                    <span v-else-if="role === ROLE_CHOICES[3]">Huỷ yêu cầu</span>
                  </div>
                </b-button>
              </b-overlay>
            </div>
          </b-card-body>
        </b-card>

        <b-card v-if="SAFE_ROLES.includes(role)" no-body class="gedf-card card-group-link">
          <b-list-group flush>
            <b-list-group-item
              v-for="(item,i) in pagesWithRole"
              v-html="item.htmlContent"
              :key="i"
              :active="$route.path == item.href"
              :to="item.href"
              @click="handlingGroupPage(item)"
            ></b-list-group-item>
          </b-list-group>
          <b-card-body v-if="instance.tags.length">
            <div class="w-100 tags">
              <tag-list :tags="instance.tags"></tag-list>
            </div>
          </b-card-body>
        </b-card>

        <b-card v-else no-body class="gedf-card card-group-info">
          <b-card-body>
            <p class="text-dark">
              <i class="fas fa-flag"></i>
              Ngày tạo nhóm: {{verboseDate}}
            </p>
            <p class="text-dark">
              <i class="fas fa-sun"></i> Được tạo bởi:
              <a href="#" class="font-weight-bold">{{instance.create_by.full_name}}</a>
            </p>
            <h6 v-if="reverseParentName" class="text-muted mb-2">Nhóm trực thuộc:</h6>
            <p class="text-dark">
              <a
                href="#"
                class="font-weight-bold"
              >{{reverseParentName}}</a>
            </p>
            <div class="w-100 tags">
              <tag-list :tags="instance.tags"></tag-list>
            </div>
          </b-card-body>
        </b-card>
      </div>
    </b-col>
    <b-col md="8" class="group-content">
      <div class="group-header mb-3">
        <b-card
          overlay
          :img-src="bannerReverse"
          img-alt="Card Image"
          text-variant="white"
          class="gedf-card"
        ></b-card>
      </div>
      <div v-if="SAFE_ROLES.includes(role)" class="group-body--member">
        <client-only>
          <NuxtChild :instance="instance" :role="role" :isJoinGroup="isJoinGroup" />
        </client-only>
      </div>
      <div v-else class="group-body group-body--owner">
        <b-card no-body class="gedf-card">
          <b-card-body>
            <h6 class="text-muted mb-3">Mô tả</h6>
            <p v-html="instance.description"></p>
          </b-card-body>
        </b-card>
      </div>
    </b-col>
  </b-row>
</template>
<style>
/* .page-group .group-content {
    padding: 0 18px;
    overflow: auto;
  } */
</style>