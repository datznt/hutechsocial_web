<script>
import UserItem from "@/components/UserItem";
import { BulletListLoader } from "vue-content-loader";
import client from "@/services/client";
import _ from 'lodash';
export default {
  name: "group-member-inviter-form",
  components: { UserItem, BulletListLoader },
  props: ["group"],
  data() {
    return {
      q: "",
      isTyping: false,
      search: {
        next: "",
        results: []
      }
    };
  },
  watch: {
    q: _.debounce(function() {
      this.searchQ();
    }, 500)
  },
  methods: {
    async searchQ() {
      if (!this.q) {
        this.search.results = [];
        this.search.next = "";
        return;
      }
      try {
        const { data } = await client.user("search", { q: this.q });
        _.remove(data.results, user => user.id == this.$auth.user.id);
        Object.assign(this.search, {
          next: data.next,
          results: data.results
        });
      } catch (err) {
        console.error(err);
      }
    },
    async infiniteHandler($state) {
      if (!this.search.next) {
        $state.complete();
        return;
      }
      try {
        const { data } = await client.user("get", { url: this.search.next });
        if (data.results.length) {
          _.remove(data.results, user => user.id == this.$auth.user.id);
          Object.assign(this.search, {
            next: data.next,
            results: [...this.search.results, ...data.results]
          });
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        /*ERROR
            An error occurred,
            please check the connection or try again in a few minutes
        */
        console.error(err);
        this.$bvToast.toast(
          `An error occurred, please check the connection or try again in a few minutes!`,
          {
            title: `An error occurred`,
            toaster: "b-toaster-bottom-right",
            variant: "danger"
          }
        );
      }
    },
    handleClick(user) {
      this.$emit("selected", user);
    }
  }
};
</script>
<template>
  <div class="group-member-inviter-form-wrapper w-100">
    <b-form class="position-relative">
      <b-form-group id="nput-inviter-name" label-for="input-inviter-name">
        <b-form-input
          id="input-inviter-name"
          type="text"
          required
          trim
          v-model="q"
          placeholder="Tên người dùng, tên tài khoản hoặc email"
        ></b-form-input>
      </b-form-group>
      <div
        class="w-100 position-absolute bg-light p-2 border rounded shadow-lg search-result-wrapper overflow-auto"
        style="max-height:15rem; z-index:9999"
        v-if="search.results && search.results.length"
      >
        <div class="list-result">
          <user-item
            v-for="(item,i) in search.results"
            :key="i"
            :avatar="item.avatar"
            :username="item.full_name"
            href="#"
            v-on:click="handleClick(item)"
          >
            <template v-slot:bottom>
              <p class="user-text">{{item.username}} &middot; {{item.email}}</p>
            </template>
          </user-item>
          <infinite-loading @infinite="infiniteHandler">
            <div slot="spinner">
              <bullet-list-loader :speed="2"></bullet-list-loader>
            </div>
            <div slot="no-more">
              <div class="d-none"></div>
            </div>
            <div slot="no-results">
              <div class="d-none"></div>
            </div>
          </infinite-loading>
        </div>
      </div>
    </b-form>
  </div>
</template>