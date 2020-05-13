<script>
import { mapGetters } from "vuex";
import UserItem from "@/components/UserItem";
import CompanyItem from "@/components/CompanyItem";
import GroupItem from "@/components/GroupItem";
import client from "@/services/client";
import _ from "lodash";

export default {
  components: {
    UserItem,
    GroupItem,
    CompanyItem
  },
  head: {
    title: "Search in Aj"
  },
  beforeCreate() {
    console.log(this.$route);
  },
  created() {
    console.log(this);

    this.searchTypes = {
      User: "u:",
      Company: "c:",
      Group: "g:"
    };
    this.icons = {
      User: '<i class="fas fa-user" style="color: rgb(198, 33, 104);"></i> ',
      Group: '<i class="fas fa-users" style="color: rgb(0, 83, 156);"></i> ',
      Company: '<i class="fas fa-building text-primary" ></i> '
    };
  },
  data() {
    return {
      showResults: false,
      searchType: "u:",
      searchValue: "",
      searchResult: {
        type: "u:",
        next: "",
        results: []
      }
    };
  },
  computed: {
    q: {
      get() {
        return this.$store.state.searchbar.q;
      },
      set(value) {
        this.$store.commit("searchbar/setQ", value);
      }
    },
    validation() {
      return this.q.length > 0;
    }
  },
  methods: {
    reverseQ() {
      let iconTarget = "";
      if (this.q.startsWith(this.searchTypes.Group)) {
        this.searchValue = this.q.split(this.searchTypes.Group)[1];
        iconTarget = this.icons.Group;
        this.searchType = this.searchTypes.Group;
      } else if (this.q.startsWith(this.searchTypes.Company)) {
        this.searchValue = this.q.split(this.searchTypes.Company)[1];
        iconTarget = this.icons.Company;
        this.searchType = this.searchTypes.Company;
      } else {
        this.searchValue = this.q.startsWith(this.searchTypes.User)
          ? this.q.split(this.searchTypes.User)[1]
          : this.q;
        iconTarget = this.icons.User;
        this.searchType = this.searchTypes.User;
      }
      return !!this.searchValue
        ? `${iconTarget} "<i>${this.searchValue}</i>"`
        : "";
    },
    searchQ() {
      this.showResults = true;
      this.searchResult.results = [];
      this.searchResult.type = this.searchType;
      console.log(this);

      const callback = {
        error: err => {
          /*ERROR
            An error occurred,
            please check the connection or try again in a few minutes
          */
          console.log(err);
          this.$bvToast.toast(
            `An error occurred, please check the connection or try again in a few minutes!`,
            {
              title: `An error occurred`,
              toaster: "b-toaster-bottom-right",
              variant: "danger"
            }
          );
        },
        success: resp => {
          this.searchResult.next = resp.next;
          this.searchResult.results = [
            ...this.searchResult.results,
            ...resp.results
          ];
        }
      };
      if (this.searchType === this.searchTypes.Group) {
        groupManager.search(this.searchValue, callback);
      } else if (this.searchType === this.searchTypes.Company) {
        companyManager.search(this.searchValue, callback);
      } else if (this.searchType === this.searchTypes.User) {
        userManager.search(this.searchValue, callback);
      }
    },
    async followUser(userId) {
      await client
        .follow("create", {
          content_type: "user",
          object_id: userId,
          create_by: _.get(this.$auth, "user.id")
        })
        .then(resp => {
          console.log(resp);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};
</script>
<template>
  <!-- <div class="container-fluid page page-index mt-2"> -->
  <b-container class="page page-seach">
    <b-row>
      <b-col class="col-sm-4">
        <h4 class="font-weight-bold">SEARCH</h4>
        <h5 class="text-muted" v-html="reverseQ()"></h5>
        <div class="w-100">
          <b-form @submit.stop.prevent>
            <b-input v-model="q" :state="validation" id="feedback-user"></b-input>
            <b-form-invalid-feedback :state="validation">This field cannot be empty.</b-form-invalid-feedback>
            <!-- <b-form-valid-feedback :state="validation">Looks Good.</b-form-valid-feedback> -->
            <b-form-text id="tags-remove-on-delete-help">
              If the search value is prefixed with
              <kbd>{{searchTypes.User}}</kbd> then the value will search only the
              <code>user</code>. similar to
              <kbd>{{this.searchTypes.Company}}</kbd> is
              <code>company</code> and
              <kbd>{{this.searchTypes.Group}}</kbd> is
              <code>group</code>
            </b-form-text>
            <b-button
              variant="primary"
              class="mt-3 font-weight-bold"
              size="lg"
              :disabled="!validation"
              @click="searchQ"
            >
              <i class="fas fa-search"></i> search
            </b-button>
          </b-form>
        </div>
      </b-col>
      <b-col class="col-sm-8">
        <div class="search-page-banner" v-show="!showResults">
          <!-- <b-img src="/images/clip-2.png" fluid alt="Responsive image" /> -->
          <b-img src="/images/searching.png" fluid alt="Responsive image" />
        </div>
        <div class="search-page-result" v-show="showResults">
          <b-card no-body class="p-3" v-if="searchResult.results.length">
            <ul class="search-result-wrapper">
              <li class="search-result-item" v-for="(item,i) in searchResult.results" :key="i">
                <user-item
                  v-if="searchResult.type === searchTypes.User"
                  v-bind:avatar="item.avatar"
                  v-bind:username="item.full_name"
                  href="#"
                >
                  <template v-slot:bottom>
                    <div class="user-follow">
                      <b-button
                        class="btn-join-group"
                        variant="primary"
                        size="sm"
                        @click="followUser(item.id)"
                      >
                        <i class="fas fa-plus"></i> Follow
                      </b-button>
                    </div>
                  </template>
                </user-item>
                <!-- v-bind:industry="item.industry" -->
                <company-item
                  v-else-if="searchResult.type === searchTypes.Company"
                  v-bind:logo="item.logo"
                  v-bind:name="item.name"
                  href="#"
                  v-bind:follow="true"
                />
                <group-item
                  v-else-if="searchResult.type === searchTypes.Group"
                  v-bind:name="item.name"
                  v-bind:members="item.members"
                  href="#"
                  v-bind:join="true"
                />
              </li>
            </ul>
            <b-button variant="primary" v-show="searchResult.next">
              <i class="far fa-arrow-alt-circle-down"></i> Load more
            </b-button>
          </b-card>
          <div v-else>
            <h4>No result is found</h4>
            <b-img src="/images/no-result.svg" fluid alt="Responsive image" style="width:15rem" />
          </div>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>
<style>
.search-result-wrapper {
  list-style-type: none;
  padding-left: 0;
}
.search-result-item {
  padding: 8px 0;
}
</style>