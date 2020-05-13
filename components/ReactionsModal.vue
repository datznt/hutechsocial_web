<script>
import UserItem from "./UserItem";
export default {
  name: "reactions-modal",
  components: {
    UserItem
  },
  props: {
    id: String,
    common: Object
  },
  data() {
    return {
      show: false,
      reaction: {
        next: "",
        results: []
      }
    };
  },
  created() {
    // this.next = this.common.location;
    this.reaction.next = this.common.location;
  },
  methods: {
    load() {
      this.show = false;
    },
    async infiniteHandler($state) {
      if (!this.reaction.next) {
        $state.complete();
        return;
      }
      await this.$axios
        .$get(this.reaction.next, { progress: false })
        .then(resp => {
          if (resp.results.length) {
            this.reaction.next = resp.next;
            this.reaction.results = [...this.reaction.results, ...resp.results];
            $state.loaded();
          } else {
            $state.complete();
          }
        })
        .catch(err => {
          this.show = true;
          console.error(err);
        });
    }
  }
};
</script>
<template>
  <b-modal :id="id" size="md" centered hide-footer scrollable title="Reactions" @shown="load()">
    <b-overlay :show="show" no-wrap></b-overlay>
    <b-container fluid style="margin:-1rem">
      <b-col>
        <ul style="padding-left:0;list-style-type:none">
          <li v-for="(item,i) in reaction.results" :key="i">
            <b-row style="padding: 8px 0">
              <b-col>
                <user-item
                  v-bind:avatar="item.create_by.avatar"
                  :username="item.create_by.full_name"
                  description="h1llo anymore"
                  href="#"
                />
              </b-col>
              <b-col cols="2" class="d-flex justify-content-center align-items-center">
                <div v-if="item.react_type === 'H'">
                  <span class="reaction-icon icon-haha"></span> &nbsp;Haha
                </div>
                <div v-else-if="item.react_type === 'O'">
                  <span class="reaction-icon icon-love"></span> &nbsp;Love
                </div>
                <div v-else-if="item.react_type === 'S'">
                  <span class="reaction-icon icon-sad"></span> &nbsp;Sad
                </div>
                <div v-else-if="item.react_type === 'A'">
                  <span class="reaction-icon icon-angry"></span> &nbsp;Angry
                </div>
                <div v-else-if="item.react_type === 'L'">
                  <span class="reaction-icon icon-like"></span> &nbsp;Like
                </div>
              </b-col>
            </b-row>
          </li>
          <infinite-loading @infinite="infiniteHandler"></infinite-loading>
        </ul>
      </b-col>
    </b-container>
  </b-modal>
</template>