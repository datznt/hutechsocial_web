<script>
import { mapState, mapGetters } from "vuex";
export default {
  name: "nav-bar",
  methods: {
    async logout() {
      await this.$auth.logout();
    },
    redirectToSearch() {
      this.$router.push(`/search/`);
    }
  },
  computed: {
    ...mapGetters(["isAuthenticated", "loggedInUser"]),
    q: {
      get() {
        return this.$store.state.searchbar.q;
      },
      set(value) {
        this.$store.commit("searchbar/setQ", value);
      }
    }
  }
};
</script>
<template>
  <b-navbar
    toggleable="lg"
    type="light"
    variant="light"
    fixed="top"
    class="border-bottom page-header"
  >
    <b-navbar-brand href="/" class="font-weight-bold">Aj</b-navbar-brand>
    <div class="searchbar-wrapper">
      <!-- <b-button variant="link" @click="redirectToSearch()"><i class="fas fa-search"></i> Search</b-button> -->
      <div class="bg-light rounded rounded-pill border border-primary">
        <div class="input-group">
          <b-input
            type="search"
            placeholder="Tìm công ty, việc làm?"
            aria-describedby="btnSearch"
            v-model="q"
            class="form-control border-0 bg-light rounded-pill"
          />
          <div class="input-group-append">
            <button
              id="btnSearch"
              type="button"
              class="btn btn-link text-primary"
              @click="redirectToSearch()"
            >
              <i class="fa fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="searchbar-results"></div> -->
    </div>
    <!-- #478288 -->
    <b-navbar-toggle target="nav-collapse" class="border-0"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item href="/" >
          <fa-icon :icon="['fas','home']"/> Trang chủ
        </b-nav-item>
        <b-nav-item href="/jobs/" >
          <fa-icon :icon="['fas','briefcase']"/> Việc làm
        </b-nav-item>
        <b-nav-item href="/jobs/" >
          <fa-icon :icon="['fas','users']"/> Nhóm
        </b-nav-item>
        <b-nav-item href="/jobs/" >
          <fa-icon :icon="['fas','building']"/> Công ty
        </b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right>
          <template v-slot:button-content>
            <i class="fas fa-globe"></i>
          </template>
          <b-dropdown-item href="#">English</b-dropdown-item>
          <b-dropdown-item href="#">Tiếng Việt</b-dropdown-item>
          <b-dropdown-item href="#">日本語</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown right v-if="$auth.loggedIn">
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em v-if="isAuthenticated">{{loggedInUser.full_name}}</em>
            <em v-else>User</em>
          </template>
          <b-dropdown-item href="#">Profile</b-dropdown-item>
          <b-dropdown-item @click="logout">Sign Out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<style>
.searchbar--active {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  height: 100%;
  background: #fff;
  padding: 1rem;
  transition: 1s;
}
</style>