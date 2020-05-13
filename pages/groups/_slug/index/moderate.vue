<script>
import client from "@/services/client";
import UserItem from "@/components/UserItem";
import PostItem from "@/components/PostItem";
import { BulletListLoader, InstagramLoader } from "vue-content-loader";
import ListEmpty from "@/components/ListEmpty";
import _ from "lodash";
export default {
  components: {
    BulletListLoader,
    InstagramLoader,
    UserItem,
    PostItem,
    ListEmpty
  },
  props: ["instance", "role"],
  data: () => ({
    selected: "member",
    options: [
      { item: "member", text: "Yêu cầu tham gia" },
      { item: "post", text: "Kiểm duyệt bài viết" }
    ],
    member: {
      filter: {
        inviter: {
          options: [
            { item: 1, text: "Được mời" },
            { item: 2, text: "Do thành viên mời" },
            { item: 3, text: "Đã yêu cầu tham gia" },
            { item: 4, text: "Tất cả" }
          ],
          selected: 3
        },
        sex: {
          options: [
            { item: 1, text: "Giới tính" },
            { item: 2, text: "Nam" },
            { item: 3, text: "Nữ" },
            { item: 4, text: "Tất cả" }
          ],
          selected: 1
        },
        avatar: {
          options: [
            { item: 1, text: "Ảnh đại diện" },
            { item: 2, text: "Có ảnh đại diện" },
            { item: 3, text: "Không có ảnh đại diện" },
            { item: 4, text: "Tất cả" }
          ],
          selected: 1
        },
        date: null
      },
      data: {
        next: "#",
        results: []
      },
      identifier: ""
    },
    post: {
      filter: {
        date: null
      },
      data: {
        next: "#",
        results: []
      },
      identifier: ""
    },
    q: ""
  }),
  computed: {
    optionsWithGroupSetting() {
      var unsafe = [];
      if (this.role == "admin") {
        return this.options;
      }
      const can_approve_members = _.get(
          this.instance,
          "setting.can_approve_members",
          "only_admin"
        ),
        can_approve_posts = _.get(
          this.instance,
          "setting.can_approve_posts",
          "only_admin"
        );
      if (can_approve_members == "anyone" && can_approve_posts == "anyone") {
        return this.options;
      }
      if (can_approve_members == "only_admin") {
        unsafe.push("member");
      }
      if (can_approve_posts == "only_admin") {
        unsafe.push("post");
      }
      return _.reduce(
        this.options,
        (options, option) => {
          if (!unsafe.includes(option.item)) {
            options.push(option);
          }
          return options;
        },
        []
      );
    }
  },
  watch: {
    q: _.debounce(function() {
      if (this.selected == "member") {
        this.filterMemberChange(this.q);
      }
    }, 500),
    selected(value) {
      this.reset();
    }
  },
  created() {
    if (!this.optionsWithGroupSetting.length) {
      this.$nuxt.error({
        statusCode: 404,
        message: "Trang này không tồn tại!"
      });
    } else {
      this.selected = this.optionsWithGroupSetting[0].item;
    }
  },
  methods: {
    reset() {
      this.member.data = {
        next: "#",
        results: []
      };
      this.post.data = {
        next: "#",
        results: []
      };
      this.member.identifier = "";
      this.post.identifier = "";
    },
    filterMemberCondition() {
      let condition = {};
      // default condition
      condition["admin_accepted"] = false;
      condition["search"] = this.q;
      condition["group"] = this.instance.id;
      if (this.member.filter.date) {
        const d = this.member.filter.date,
          dStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        condition["timestamp__date"] = dStr;
      }
      if ([1, 2, 3].includes(this.member.filter.inviter.selected)) {
        if (this.member.filter.inviter.selected == 1) {
          condition["inviter__is_admin"] = true;
        } else if (this.member.filter.inviter.selected == 2) {
          condition["inviter__is_admin"] = false;
        } else if (this.member.filter.inviter.selected == 3) {
          condition["inviter__isnull"] = true;
        }
      }
      if ([2, 3].includes(this.member.filter.sex.selected)) {
        if (this.member.filter.sex.selected == 2) {
          condition["user__userprofile__gender"] = "M";
        } else if (this.member.filter.sex.selected == 3) {
          condition["user__userprofile__gender"] = "F";
        }
      }
      if ([2, 3].includes(this.member.filter.avatar.selected)) {
        if (this.member.filter.avatar.selected == 2) {
          condition["user__avatar__isnull"] = false;
        } else if (this.member.filter.avatar.selected == 3) {
          condition["user__avatar__isnull"] = true;
        }
      }
      return condition;
    },
    async infiniteHandler($state) {
      if (!this.member.data.next) {
        $state.complete();
        return;
      }
      try {
        const condition = this.filterMemberCondition();
        const { data } = await client.group("Filter members", {
          url: this.member.data.next == "#" ? null : this.member.data.next,
          params_filter: condition
        });
        console.log(data);
        if (data.results.length) {
          Object.assign(this.member.data, {
            next: data.next,
            results: [...this.member.data.results, ...data.results]
          });
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        console.error(err);
      }
    },
    async infiniteHandlerPost($state) {
      if (!this.post.data.next) {
        $state.complete();
        return;
      }
      try {
        // const condition = this.filterMemberCondition();
        const { data } = await client.group("Get the posts in the group", {
          slug: this.instance.slug,
          url: this.post.data.next == "#" ? null : this.post.data.next,
          params_filter: {
            public_code: "waiting"
          }
        });
        if (data.results.length) {
          Object.assign(this.post.data, {
            next: data.next,
            results: [...this.post.data.results, ...data.results]
          });
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        console.error(err);
      }
    },
    filterMemberChange(e) {
      this.member.identifier = e;
      this.member.data = {
        next: "#",
        results: []
      };
    },
    async memberHandling(group_user, isAccept) {
      try {
        if (isAccept) {
          const { data, status } = await client.group("Accept membership", {
            group_user_id: group_user.id,
            admin_accepted: true
          });
          if (status == 200) {
            _.remove(this.member.data.results, gu => gu.id == group_user.id);
            this.member.data.results = [...this.member.data.results];
            this.$bvToast.toast(`Đã chấp nhận ${group_user.user.full_name}`, {
              toaster: "b-toaster-bottom-right",
              variant: "success"
            });
          }
        } else {
          const { status } = await client.group("Leave group", {
            group_user_id: group_user.id
          });
          if (status == 204) {
            _.remove(this.member.data.results, gu => gu.id == group_user.id);
            this.member.data.results = [...this.member.data.results];
            this.$bvToast.toast(`Đã từ chối ${group_user.user.full_name}`, {
              toaster: "b-toaster-bottom-right",
              variant: "success"
            });
          }
        }
      } catch (err) {
        this.$bvToast.toast(_.get(err, "response.data.detail"), {
          title: "Có lỗi xảy ra!",
          toaster: "b-toaster-bottom-right",
          variant: "danger"
        });
      }
    },
    async postHandling(post, handling) {
      try {
        const dataUpdate = {
          public_code: handling
        };
        const { data, status } = await client.post("update", {
          post_id: post.id,
          data_update: dataUpdate
        });
        _.remove(this.post.data.results, p => p.id == post.id);
        this.post.data.results = [...this.post.data.results];
        if (handling == "accept") {
          this.$bvToast.toast(`Đã phê duyệt`, {
            toaster: "b-toaster-bottom-right",
            variant: "success"
          });
        }
      } catch (err) {
        this.$bvToast.toast(_.get(err, "response.data.detail"), {
          title: "Có lỗi xảy ra!",
          toaster: "b-toaster-bottom-right",
          variant: "danger"
        });
      }
    }
  }
};
</script>
<template>
  <div v-if="instance" class="group-moderte-wrapper w-100">
    <b-card
      class="gedf-card group-moderte-header"
      style="overflow: visible"
      title="Kiểm duyệt nhóm"
    >
      <div class="moderate-header">
        <b-form inline>
          <b-form-select
            v-model="selected"
            :options="optionsWithGroupSetting"
            value-field="item"
            class="mb-2 mr-2"
          ></b-form-select>
          <b-input-group class="mb-2 mr-2">
            <template v-slot:prepend>
              <b-input-group-text>
                <i class="fas fa-search"></i>
              </b-input-group-text>
            </template>
            <b-input id="inline-form-input-setting" placeholder="Tìm kiếm" v-model="q"></b-input>
          </b-input-group>
        </b-form>
      </div>
      <div class="modarate-tools">
        <div v-if="selected == 'member'" class="member-request">
          <h6>Lọc yêu cầu tham gia</h6>
          <b-form inline>
            <b-form-datepicker
              v-model="member.filter.date"
              class="mb-1 mr-1"
              size="sm"
              local="vi"
              today-button
              reset-button
              close-button
              placeholder="Ngày tham gia"
              @input="filterMemberChange()"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
              value-as-date
            ></b-form-datepicker>
            <b-form-select
              v-model="member.filter.inviter.selected"
              :options="member.filter.inviter.options"
              size="sm"
              value-field="item"
              class="mb-1 mr-1"
              @change="filterMemberChange"
            ></b-form-select>
            <b-form-select
              v-model="member.filter.sex.selected"
              :options="member.filter.sex.options"
              size="sm"
              value-field="item"
              class="mb-1 mr-1"
              @change="filterMemberChange"
            ></b-form-select>
            <b-form-select
              v-model="member.filter.avatar.selected"
              :options="member.filter.avatar.options"
              size="sm"
              value-field="item"
              class="mb-1 mr-1"
              @change="filterMemberChange"
            ></b-form-select>
          </b-form>
        </div>
        <div v-else-if="selected == 'post'" class="post-approve">
          <h6>Lọc bài viết</h6>
          <b-form inline>
            <b-form-datepicker
              v-model="member.filter.date"
              class="mb-1 mr-1"
              size="sm"
              local="vi"
              today-button
              reset-button
              close-button
              placeholder="Ngày đăng tải"
            ></b-form-datepicker>
          </b-form>
        </div>
      </div>
    </b-card>
    <div class="group-moderte-results">
      <div v-if="selected == 'member'" class="group-moderte-results--member">
        <b-card class="gedf-card">
          <div class="list-member-wapper">
            <user-item
              v-for="(item,i) in member.data.results"
              :key="i"
              :avatar="item.user.avatar"
              :username="item.user.full_name"
              href="#"
            >
              <template v-slot:bottom>
                <div class="bottom-wrapper pt-2 pb-2">
                  <b-button size="sm" variant="primary" @click="memberHandling(item,true)">Đồng ý</b-button>
                  <b-button size="sm" variant="light" @click="memberHandling(item,false)">Từ chối</b-button>
                </div>
              </template>
            </user-item>
            <infinite-loading :identifier="member.identifier" @infinite="infiniteHandler">
              <div slot="spinner">
                <bullet-list-loader :speed="2"></bullet-list-loader>
              </div>
              <div slot="no-results">
                <list-empty></list-empty>
              </div>
            </infinite-loading>
          </div>
        </b-card>
      </div>
      <div v-else-if="selected == 'post'" class="group-moderte-results--post">
        <div class="list-post-wapper">
          <!--- \\\\\\\Post-->
          <transition-group name="list-post-wapper-animate" tag="div">
            <post-item
              v-for="item in post.data.results"
              :key="item.id"
              :id="item.id"
              :content_object="item.content_object"
              :content="item.content"
              :create_at="item.create_at"
              :attaches="item.attaches"
              :summary="item.summary"
              :create_by="item.create_by"
              :my_reaction="item.my_reaction"
              :showBottom="false"
              :showSubTitle="false"
              :showDropdownTools="false"
            >
              <template v-slot:post-extra>
                <div class="p-3">
                  <b-button variant="primary" size="sm" @click="postHandling(item,'accept')">
                  <fa-icon :icon="['fas','check']" />Chấp nhận
                </b-button>
                <b-button variant="danger" size="sm" @click="postHandling(item,'reject')">
                  <fa-icon :icon="['fas','times']" />Từ chối
                </b-button>
                </div>
              </template>
            </post-item>
          </transition-group>
          <!-- Post /////-->
          <infinite-loading :identifier="post.identifier" @infinite="infiniteHandlerPost">
            <div slot="spinner">
              <b-card no-body class="gedf-card">
                <b-card-body>
                  <instagram-loader :speed="2"></instagram-loader>
                </b-card-body>
              </b-card>
            </div>
            <div slot="no-results">
              <b-card no-body class="gedf-card">
                <b-card-body>
                  <list-empty></list-empty>
                </b-card-body>
              </b-card>
            </div>
          </infinite-loading>
        </div>
      </div>
    </div>
  </div>
</template>