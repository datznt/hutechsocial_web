<script>
import GroupItem from "@/components/GroupItem";
import GroupForm from "@/components/GroupForm";
import client from "@/services/client";
import _ from "lodash";

export default {
  name: "group-menu-manager",
  props: ["location"],
  components: { GroupItem, GroupForm },
  data: () => ({
    groupsIAdmin: [],
    groupsIMember: [],
    loading: false,
    memberGroups: {
      next: "",
      resutls: []
    }
  }),
  created() {
    this.ID_MODAL_CREATE_GROUP = _.uniqueId("group-modal-");
    this.loadMore();
  },
  methods: {
    createGroupSuccess(newGroup) {
      this.reset();
      this.$bvModal.hide(this.ID_MODAL_CREATE_GROUP);
      this.$router.push(`/groups/${newGroup.slug}/`);
    },
    async loadMore() {
      this.loading = true;
      await client
        .group("Find groups for which I am a member", {
          user_id: this.$auth.user.id,
          url: this.memberGroups.next
        })
        .then(resp => {
          this.memberGroups.next = resp.data.next;
          if (resp.data.results.length > 0) {
            const gias = _.reduce(
              resp.data.results,
              function(results, item, key) {
                const { admin_accepted, user_accepted, is_admin } = item;
                if (admin_accepted && user_accepted && is_admin) {
                  results.push(item);
                }
                return results;
              },
              []
            );
            const gims = _.reduce(
              resp.data.results,
              function(results, item, key) {
                const { admin_accepted, user_accepted, is_admin } = item;
                if (admin_accepted && user_accepted && !is_admin) {
                  results.push(item);
                }
                return results;
              },
              []
            );
            this.groupsIAdmin = [...this.groupsIAdmin, ...gias];
            this.groupsIMember = [...this.groupsIMember, ...gims];
            console.log(this.groupsIAdmin);
          }
          this.loading = false;
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        });
    },
    bindUrl(group) {
      return `/groups/${group.slug}/`;
    },
    reset() {
      this.groupsIAdmin = [];
      this.groupsIMember = [];
      this.memberGroups = {
        next: "",
        resutls: []
      };
      this.loadMore();
    }
  }
};
</script>

<template>
  <b-overlay :show="loading" rounded="sm">
    <b-card
      title="Khám phá nhóm"
      img-src="https://media.istockphoto.com/vectors/vector-illustration-flat-style-businessmen-discuss-social-network-of-vector-id1062169958?k=6&m=1062169958&s=612x612&w=0&h=oG8MeXyINTtGAReZBsrxANYXHXRcXuBe9W9XTrDHVPI="
      img-alt="Image"
      img-top
      class="gedf-card"
    >
      <h6 v-if="groupsIAdmin.length" class="text-muted">Nhóm bạn quản lý</h6>
      <group-item
        v-for="(item,i) in groupsIAdmin"
        :key="'gia' + i"
        class="mb-1"
        :href="bindUrl(item.group)"
        :name="item.group.name"
      />
      <h6 v-if="groupsIMember.length" class="text-muted">Nhóm bạn tham gia</h6>
      <group-item
        v-for="(item,i) in groupsIMember"
        :key="'gim'+i"
        class="mb-1"
        :href="bindUrl(item.group)"
        :name="item.group.name"
      />
      <b-button v-if="groupsIMember.next" variant="link" @click="loadMore">
        <i class="fas fa-arrow-down"></i> Tải thêm
      </b-button>
      <b-button
        class="mt-2 w-100"
        variant="primary"
        size="sm"
        @click="$bvModal.show(ID_MODAL_CREATE_GROUP)"
      >
        <i class="fas fa-plus-circle"></i> Tạo Nhóm
      </b-button>
      <b-modal :id="ID_MODAL_CREATE_GROUP" centered hide-footer>
        <template v-slot:modal-title>Tạo nhóm mới</template>
        <b-container>
          <b-row>
            <group-form :location="location" @createSuccess="createGroupSuccess" />
          </b-row>
        </b-container>
      </b-modal>
    </b-card>
  </b-overlay>
</template>
<style scoped>
/* .group-item{
  margin-bottom: 0.5rem;
} */
</style>