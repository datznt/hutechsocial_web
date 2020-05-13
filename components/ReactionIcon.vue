<script>
import _ from 'lodash';
import ReactionsModal from "@/components/ReactionsModal";
export default {
  name: "reaction-icon",
  props: ["reactions_count", "my_reaction", "styleClass"],
  components: { ReactionsModal },
  data: () => ({ id: "" }),
  created() {
    this.id = _.uniqueId("reaction-icon-");
  },
  methods: {
    totalReactions() {
      return _.reduce(
        this.reactions_count,
        (count, item) => {
          return count + item;
        },
        0
      );
    }
  }
};
</script>
<template>
  <b-button
    v-if="totalReactions() != 0"
    variant="link"
    @click="$root.$emit('bv::show::modal', 'modal-reaction-'+id, $event.target)"
  >
    <span v-if="reactions_count[1] != 0" class="reaction-icon reaction-icon-75">
      <img src="/images/reactions/like.svg" alt />
    </span>

    <span v-if="reactions_count[2] != 0" class="reaction-icon reaction-icon-75">
      <img src="/images/reactions/celebrate.svg" alt />
    </span>

    <span v-if="reactions_count[3] != 0" class="reaction-icon icon-love reaction-icon-75">
      <img src="/images/reactions/love.svg" alt />
    </span>

    <span v-if="reactions_count[4] != 0" class="reaction-icon reaction-icon-75">
      <img src="/images/reactions/insightful.svg" alt />
    </span>

    <span v-if="reactions_count[5] != 0" class="reaction-icon reaction-icon-75">
      <img src="/images/reactions/curious.svg" alt />
    </span>

    <span>{{totalReactions()}}</span>
    <!-- <reactions-modal :id="'modal-reaction-'+id" v-bind:common="reactions" /> -->
  </b-button>
</template>