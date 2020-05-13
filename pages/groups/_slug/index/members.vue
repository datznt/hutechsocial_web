<script>
import client from "@/services/client";
import UserItem from "@/components/UserItem";
import GroupMemberInviterForm from "@/components/GroupMemberInviterForm";
import TagList from "@/components/TagList";
// import TimeAgo from "vue2-timeago";
import { BulletListLoader } from "vue-content-loader";
import ListEmpty from "@/components/ListEmpty";
import _ from 'lodash';
export default {
  components: {
    UserItem,
    // TimeAgo,
    GroupMemberInviterForm,
    TagList,
    BulletListLoader,
    ListEmpty
  },
  props: ["instance", "role", "isJoinGroup"],
  data: () => ({
    loading: false,
    member: {
      next: "#",
      results: [],
      loading: false,
      myInfo: null
    },
    inviting: {
      user: null,
      loading: false,
      hasInviting: false
    },
    q: "",
    infiniteId: ""
  }),
  watch: {
    q: _.debounce(function() {
      _.assign(this.member, {
        next: "#",
        results: []
      });
      this.infiniteId = this.q;
    }, 500)
  },
  created() {
    this.MODAL_INVITER = "modal-group-member-inviter";
    console.log(this.instance);
  },
  methods: {
    isMyObject(item) {
      if (_.isString(item.user)) {
        return item.user == this.$auth.user.id;
      }
      return item.user.id == this.$auth.user.id;
    },
    isAdmin(item) {
      return item.is_admin;
    },
    haveAdminRole(item) {
      if (_.has(this.instance, "my_info.is_admin")) {
        return this.instance.my_info.is_admin;
      }
      return false;
    },
    canChangeAdminRole(item) {
      return this.haveAdminRole(item) && !item.is_admin;
    },
    async leaveGroup(item) {
      const { status } = await client.group("Leave group", {
        group_user_id: item.id
      });
      this.$forceUpdate();
    },
    onUserSelected(user) {
      this.inviting.user = user;
      this.inviting.hasInviting = true;
    },
    deleteInviting() {
      this.inviting.hasInviting = false;
      // this.inviting.user = null;
    },
    async joinTheGroup() {
      this.inviting.loading = true;
      try {
        const resp = await client.group("Invite user to the group", {
          group_id: this.instance.id,
          user_id: this.inviting.user.id,
          inviter_id: this.instance.my_info.id,
          admin_accepted: this.role == "admin"
        });
        this.$bvToast.toast(
          `Đã mời ${this.inviting.user.full_name} vào ${this.instance.name}`,
          {
            title: "Thành công!",
            toaster: "b-toaster-bottom-right",
            variant: "success"
          }
        );
        this.$bvModal.hide(this.MODAL_INVITER);
      } catch (err) {
        /*ERROR
            An error occurred,
            please check the connection or try again in a few minutes
        */
        const resp = err.response;
        if (resp.data && resp.status == 400) {
          const errorMessage = err.response.data;
        }
        if (resp.status == 400 && _.has(resp, "data.non_field_errors")) {
          if (
            resp.data.non_field_errors.includes(
              "The fields user, group must make a unique set."
            )
          ) {
            this.$bvToast.toast(
              `${this.inviting.user.full_name} đã được mời vào nhóm hoặc là thành viên của nhóm này.`,
              {
                title: "Thông tin!",
                toaster: "b-toaster-bottom-right",
                variant: "info"
              }
            );
          }
        } else {
          this.$bvToast.toast(err.toString(), {
            title: "Có lỗi đã xảy ra",
            toaster: "b-toaster-bottom-right",
            variant: "danger"
          });
        }
      }
      this.inviting.loading = false;
    },
    async infiniteHandler($state) {
      if (!this.member.next) {
        $state.complete();
        return;
      }
      try {
        const { data } = await client.group("Filter members", {
          url: this.member.next == "#" ? null : this.member.next,
          params_filter: {
            user_accepted: true,
            admin_accepted: true,
            group: this.instance.id,
            search: this.q
          }
        });
        if (data.results.length) {
          _.remove(
            data.results,
            g => g.id == _.get(this.isJoinGroup, "id", null)
          );
          Object.assign(this.member, {
            next: data.next,
            results: [...this.member.results, ...data.results]
          });
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        console.error(err);
      }
    },
    async changePermission(user, { admin }) {
      if (this.role != "admin") {
        return;
      }
      try {
        const { data } = await client.group("Change permissions", {
          group_user_id: user.id,
          is_admin: admin
        });
        user.is_admin = data.is_admin;
      } catch (err) {
        console.log(err);
      }
    }
  },
  computed: {
    canInviter() {
      return (
        this.role == "admin" ||
        (this.role == "member" &&
          this.instance.setting.can_approve_members == "anyone")
      );
    }
  }
};
</script>
<template>
  <div class="group-members-wrapper w-100">
    <b-card no-body class="gedf-card card-inviter">
      <b-card-body>
        <div class="d-flex justify-content-between w-100 group-members-control">
          <div class="group-members-control-search">
            <b-input-group>
              <template v-slot:prepend>
                <b-input-group-text>
                  <fa-icon :icon="['fas', 'search']" />
                </b-input-group-text>
              </template>
              <b-form-input placeholder="Tìm thành viên" v-model="q" trim></b-form-input>
            </b-input-group>
          </div>
          <div class="group-members-control-inviter">
            <b-button
              v-if="canInviter"
              class="btn-inviter"
              variant="primary"
              v-b-modal="MODAL_INVITER"
            >Mời thành viên</b-button>
            <b-modal :id="MODAL_INVITER" centered hide-footer>
              <b-container>
                <b-row>
                  <h5 class="text-center">
                    <span class="text-muted">Mời người khác vào nhóm</span>
                    {{instance.name}}
                  </h5>
                </b-row>
                <b-row v-if="!inviting.hasInviting">
                  <group-member-inviter-form :group="instance.id" v-on:selected="onUserSelected"></group-member-inviter-form>
                </b-row>
                <b-row v-else>
                  <user-item
                    :avatar="inviting.user.avatar"
                    :username="inviting.user.full_name"
                    :isSelected="true"
                    href="#"
                  >
                    <template v-slot:bottom>
                      <p
                        class="user-text"
                      >{{inviting.user.username}} &middot; {{inviting.user.email}}</p>
                    </template>
                    <template v-slot:right>
                      <b-button variant="link" @click="deleteInviting">
                        <i class="fas fa-times text-danger"></i>
                      </b-button>
                    </template>
                  </user-item>
                </b-row>
                <b-row class="pb-2 pt-2">
                  <b-overlay
                    :show="inviting.loading"
                    rounded
                    opacity="0.9"
                    spinner-small
                    spinner-variant="primary"
                    class="w-100"
                  >
                    <b-button
                      v-if="inviting.hasInviting"
                      class="w-100"
                      variant="primary"
                      :disabled="!inviting.user"
                      @click="joinTheGroup"
                    >Mời {{inviting.user.username}} vào nhóm</b-button>
                  </b-overlay>
                </b-row>
              </b-container>
            </b-modal>
          </div>
        </div>
        <div v-if="member.results" class="mt-3 group-members-member">
          <div class="local-user-information">
            <user-item
              v-if="isJoinGroup"
              :avatar="$auth.user.avatar"
              :username="$auth.user.full_name"
              href="#"
            >
              <template v-slot:bottom>
                <p class="user-text">
                  Đã tham gia
                  <!-- <time-ago :datetime="isJoinGroup.timestamp" :auto-update="60"></time-ago>trước -->
                </p>
                <p class="user-text" v-if="isJoinGroup.is_admin">
                  <fa-icon :icon="['fas', 'shield-alt']" />Quản trị viên
                </p>
                <p class="user-text" v-else>
                  <fa-icon :icon="['fas', 'user']" />Thành viên
                </p>
              </template>
              <template v-slot:right>
                <b-dropdown
                  :id="'dropdown-1'"
                  variant="link"
                  right
                  toggle-class="text-secondary"
                  no-caret
                >
                  <template v-slot:button-content>
                    <fa-icon :icon="['fas', 'ellipsis-h']" />
                  </template>
                  <b-dropdown-item
                    v-if="isMyObject(isJoinGroup)"
                    @click="leaveGroup(isJoinGroup)"
                  >Rời khỏi nhóm</b-dropdown-item>
                  <b-dropdown-item
                    v-if="haveAdminRole(isJoinGroup) && isAdmin(isJoinGroup)"
                    @click="changePermission(isJoinGroup,{admin:false})"
                  >Gỡ vai trò quản trị viên</b-dropdown-item>
                  <b-dropdown-item
                    v-if="canChangeAdminRole(isJoinGroup)"
                    @click="changePermission(isJoinGroup,{admin:true})"
                  >Thay đổi thành quản trị viên</b-dropdown-item>
                </b-dropdown>
              </template>
            </user-item>
          </div>
          <h6>Thành viên</h6>
          <div class="list-member">
            <user-item
              v-for="(item,i) in member.results"
              :key="i"
              :avatar="item.user.avatar"
              :username="item.user.full_name"
              href="#"
            >
              <template v-slot:bottom>
                <p class="user-text">
                  Đã tham gia
                  <!-- <time-ago :datetime="item.timestamp" :auto-update="60"></time-ago>trước -->
                </p>
                <p class="user-text" v-if="item.is_admin">
                  <fa-icon :icon="['fas', 'shield-alt']" />Quản trị viên
                </p>
                <p class="user-text" v-else>
                  <fa-icon :icon="['fas', 'user']" />Thành viên
                </p>
              </template>
              <template v-slot:right>
                <b-dropdown
                  :id="'dropdown'+i"
                  variant="link"
                  right
                  toggle-class="text-secondary"
                  no-caret
                >
                  <template v-slot:button-content>
                    <fa-icon :icon="['fas', 'ellipsis-h']" />
                  </template>
                  <b-dropdown-item v-if="isMyObject(item)" @click="leaveGroup(item)">Rời khỏi nhóm</b-dropdown-item>
                  <b-dropdown-item
                    v-if="haveAdminRole(item) && isAdmin(item)"
                    @click="changePermission(item,{admin:false})"
                  >Gỡ vai trò quản trị viên</b-dropdown-item>
                  <b-dropdown-item
                    v-if="canChangeAdminRole(item)"
                    @click="changePermission(item,{admin:true})"
                  >Thay đổi thành quản trị viên</b-dropdown-item>
                </b-dropdown>
              </template>
            </user-item>
            <infinite-loading :identifier="infiniteId" @infinite="infiniteHandler">
              <div slot="spinner">
                <bullet-list-loader :speed="2"></bullet-list-loader>
              </div>
              <div slot="no-results">
                <list-empty></list-empty>
              </div>
            </infinite-loading>
          </div>
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>