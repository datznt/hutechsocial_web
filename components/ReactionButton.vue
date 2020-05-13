<script>
import client from "@/services/client";
import _ from 'lodash';
export default {
  name: "reaction-button",
  props: ["reactions", "type", "my_reaction", "object_id", "styleClass"],
  data() {
    return {
      id: "",
      myReaction: {
        react: 0,
        isActive: false,
        node: ""
      }
    };
  },
  created() {
    this.id = _.uniqueId("btn-reaction-");
    if (this.my_reaction) {
      Object.assign(this.myReaction, {
        isActive: true,
        react: this.my_reaction.react_type,
        node: this.my_reaction.id
      });
    }
  },
  methods: {
    async reactionIconOnClick(type) {
      try {
        if (this.myReaction.isActive) {
          // update or delete reaction
          if (this.myReaction.react === type) {
            const { status } = await client.react("delete", {
              react_id: this.myReaction.node
            });
            this.myReaction = { isActive: false, react: 0, node: "" };
          } else {
            const { data, status } = await client.react("update", {
              react_id: this.myReaction.node,
              react_type: type
            });
            this.myReaction = Object.assign({}, this.myReaction, {
              isActive: true,
              react: data.react_type,
              node: data.id
            });
          }
        } else {
          // create reaction
          const { data, status } = await client.react("create", {
            target_type: this.type,
            object_id: this.object_id,
            react_type: type
          });
          this.myReaction = Object.assign({}, this.myReaction, {
            isActive: true,
            react: data.react_type,
            node: data.id
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  },
  computed: {
    variantWithType() {
      return this.type == "post" ? "light" : "link";
    }
  }
};
</script>

<template>
  <b-button
    size="sm"
    :variant="variantWithType"
    :class="['post-social-buttons-same']"
    :id="'popover-'+id"
    @click="reactionIconOnClick(1)"
  >
    <div v-if="myReaction.react === 1">
      <span :class="['reaction-icon',styleClass]">
        <img src="/images/reactions/like.svg" alt />
      </span>
    </div>
    <div v-else-if="myReaction.react === 2">
      <span :class="['reaction-icon',styleClass]">
        <img src="/images/reactions/celebrate.svg" alt />
      </span>
    </div>
    <div v-else-if="myReaction.react === 3">
      <span :class="['reaction-icon',styleClass]">
        <img src="/images/reactions/love.svg" alt />
      </span>
    </div>
    <div v-else-if="myReaction.react === 4">
      <span :class="['reaction-icon',styleClass]">
        <img src="/images/reactions/insightful.svg" alt />
      </span>
    </div>
    <div v-else-if="myReaction.react === 5">
      <span :class="['reaction-icon',styleClass]">
        <img src="/images/reactions/curious.svg" alt />
      </span>
    </div>
    <div v-else>
      <span :class="['reaction-icon',styleClass]">
        <fa-icon :icon="['far','thumbs-up']" class="no-reaction" />
      </span>
    </div>
    <b-popover :target="'popover-'+id" triggers="hover" placement="top" delay="500">
      <div class="d-flex justify-content-around align-items-center reaction-bar">
        <span
          class="reaction-icon reaction-icon-145 ml-2 mr-2"
          v-b-tooltip.hover
          title="Thích"
          @click="reactionIconOnClick(1)"
        >
          <img src="/images/reactions/like.svg" alt />
        </span>
        <span
          class="reaction-icon reaction-icon-145 ml-2 mr-2"
          v-b-tooltip.hover
          title="Haha"
          @click="reactionIconOnClick(2)"
        >
          <img src="/images/reactions/celebrate.svg" alt />
        </span>
        <span
          class="reaction-icon reaction-icon-145 ml-2 mr-2"
          v-b-tooltip.hover
          title="Buồn"
          @click="reactionIconOnClick(3)"
        >
          <img src="/images/reactions/love.svg" alt />
        </span>
        <span
          class="reaction-icon reaction-icon-145 ml-2 mr-2"
          v-b-tooltip.hover
          title="Yêu thích"
          @click="reactionIconOnClick(4)"
        >
          <img src="/images/reactions/insightful.svg" alt />
        </span>
        <span
          class="reaction-icon reaction-icon-145 ml-2 mr-2"
          v-b-tooltip.hover
          title="Phẫn nộ"
          @click="reactionIconOnClick(5)"
        >
          <img src="/images/reactions/curious.svg" alt />
        </span>
      </div>
    </b-popover>
  </b-button>
</template>
<style lang="scss">

</style>