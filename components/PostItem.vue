<script>
import CricleAvatar from "@/components/CricleAvatar";
import ReactionsModal from "@/components/ReactionsModal";
import ReactionButton from "@/components/ReactionButton";
import ReactionIcon from "@/components/ReactionIcon";
import CommentList from "@/components/CommentList";
import FileItem from "@/components/FileItem";
import funcs from "@/utils/funcs";
// import TimeAgo from "vue2-timeago";
// import TextEditor from "@/components/TextEditor";
import LinkItem from "@/components/LinkItem";
import _ from "lodash";

export default {
  name: "post-item",
  components: {
    // TimeAgo,
    CricleAvatar,
    ReactionsModal,
    ReactionButton,
    ReactionIcon,
    CommentList,
    FileItem,
    // TextEditor,
    LinkItem
    // CommentList: () => import("@/components/CommentList")
  },
  props: {
    id: String,
    content_object: Object,
    content: String,
    create_at: String,
    create_by: Object,
    attaches: Array,
    summary: Object,
    my_reaction: Object,
    showBottom: {
      type: Boolean,
      default: true
    },
    showSubTitle: {
      type: Boolean,
      default: true
    },
    showDropdownTools: {
      type: Boolean,
      default: true
    },
    expandCommentList: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let { content } = this;
    return {
      icon: "",
      name: "",
      link: "",
      cardBodyWidth: 0,
      myReaction: {
        react: "M",
        isActive: false,
        node: ""
      },
      showComment: false,
      authorType: "",
      subLink: {
        hasSubLink: false,
        name: "",
        link: ""
      },
      file: {
        images: [],
        videos: [],
        audios: [],
        others: []
      },
      linkAttachment: null,
      isSingle: false,
      showTying: false,
      focusCommentId: null
    };
  },
  computed: {
    imagevideos() {
      return [...this.file.images, ...this.file.videos];
    },
    reverseContent() {
      return this.$sanitize(funcs.linkify(this.content));
    }
  },
  created() {
    this.DISPLAY_TYPE_CHOICES = [
      "video",
      "image",
      "audio",
      "application",
      "post"
    ];
    this.buildCardTitle();
    this.renderLayout();
    this.focusToComment();
  },
  mounted() {
    this.cardBodyWidth = document.getElementsByClassName(
      "card--post"
    )[0].offsetWidth;
  },
  methods: {
    renderLayout() {
      this.showComment = this.expandCommentList;
      this.isSingle = _.get(this.attaches, "length", 0) == 1;
      this.fileClassifier();
    },

    getThumbnail(file, dimention = 300) {
      let _result = {
        src: "",
        size: []
      };
      if (
        _.has(file, "thumbnails.location") &&
        _.has(file, "thumbnails.nodes")
      ) {
        let _default = {};
        for (const i in file.thumbnails.nodes) {
          let s = file.thumbnails.nodes[i],
            s1 = file.thumbnails.nodes[parseInt(i) + 1];
          let a = s.split("x"),
            b = a[1].split(".")[0],
            sp = [parseInt(a[0]), parseInt(b)];
          if (!s1) {
            Object.assign(_result, {
              src: file.thumbnails.location + s,
              size: sp
            });
            break;
          }
          a = s1.split("x");
          b = a[1].split(".")[0];
          let sp1 = [parseInt(a[0]), parseInt(b)];
          if (sp[0] <= dimention && dimention <= sp1[0]) {
            Object.assign(_result, {
              src: file.thumbnails.location + s1,
              size: sp1
            });
            break;
          }
        }
      }
      return _result;
    },
    thumbnailFitCard(size, cardWidth) {
      let width = size[0],
        height = size[1];
      return [cardWidth, (cardWidth / width) * height];
    },
    fileClassifier() {
      _.forEach(this.attaches, attach => {
        var attachType = _.get(attach, "content_object.type");
        if (
          attachType == "file" &&
          _.has(attach, "content_object.data.mimetype")
        ) {
          const mimetype = attach.content_object.data.mimetype.split("/")[0];
          switch (mimetype) {
            case "image":
              this.file.images.push(attach.content_object.data);
              break;
            case "video":
              this.file.videos.push(attach.content_object.data);
              break;
            case "audio":
              this.file.audios.push(attach.content_object.data);
              break;
            default:
              this.file.others.push(attach.content_object.data);
              console.log(this.file.others);

              break;
          }
        } else if (attachType == "link") {
          this.linkAttachment = _.get(attach, "content_object.data");
        }
      });
    },
    buildCardTitle() {
      console.log(this.content_object);
      if (this.content_object.type == "user") {
        let user = this.content_object.data;
        this.icon = user.avatar;
        this.name = user.full_name;
        this.authorType = "user";
        // this.link = `/users/${_.get(this.content_object, "data.slug")}/`;
      } else if (this.content_object.type == "company") {
        let company = this.content_object.data;
        this.icon = company.logo;
        this.name = company.name;
        this.authorType = "company";
        this.link = `/companies/${_.get(this.content_object, "data.slug")}/`;
      } else if (this.content_object.type == "group") {
        let user = this.create_by;
        this.icon = user.avatar;
        this.name = user.full_name;
        this.authorType = "group";
        this.subLink.hasSubLink = true;
        this.subLink.name = this.content_object.data.name;
        this.subLink.link = `/groups/${this.content_object.data.slug}/`;
      }
    },
    isMyReaction() {
      let _ismy = false;
      if (_.has(this.reactions, "my_react.data") && this.reactions.count == 1) {
        _ismy = _.has(
          this.reactions.summary,
          this.reactions.my_react.data.react_type
        );
      }
      return _ismy;
    },
    getAbstractUrl() {
      return "/posts/" + this.id + "/";
    },
    fileType(file) {
      const mimetype = _.split(_.get(file, "mimetype", "application/"), "/");
      if (mimetype.length == 0) {
        return "application";
      }
      return mimetype[0];
    },
    focusToComment() {
      const commentId = _.get(this.$route, "query.comment_id", null);
      if (commentId) {
        this.showComment = true;
        this.focusCommentId = commentId;
      }
    }
  }
};
</script>
<template>
  <b-card no-body class="gedf-card card--post" :key="id">
    <b-card-header>
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex justify-content-between align-items-center">
          <div class="mr-2">
            <cricle-avatar
              v-bind:source="icon"
              defaultSource="/images/avatar-anonymous.png"
              setSize="36"
            />
          </div>
          <div class="ml-2">
            <div class="h5 m-0">
              <nuxt-link class="text-dark" :to="link">{{name}}</nuxt-link>
              <nuxt-link
                class="text-dark"
                v-if="subLink.hasSubLink && showSubTitle"
                :to="subLink.link"
              >
                <i class="fas fa-caret-right"></i>
                {{subLink.name}}
              </nuxt-link>
            </div>
            <div class="h7 text-muted">
              <span>
                <client-only>
                  <timeago :datetime="create_at" :auto-update="60"></timeago>
                </client-only>
              </span>
            </div>
          </div>
        </div>
        <div>
          <b-dropdown
            :id="'gedf-dropdown_'+id"
            v-if="showDropdownTools"
            variant="link"
            right
            toggle-class="text-decoration-none btn-link"
            no-caret
          >
            <template v-slot:button-content>
              <i class="fas fa-ellipsis-v" style="color: #C62168;"></i>
            </template>
            <b-dropdown-item :href="getAbstractUrl()" target="_blank">Mở trong cửa sổ mới</b-dropdown-item>
            <b-dropdown-item href="#">Sao chép liên kết</b-dropdown-item>
            <b-dropdown-item href="#">Report</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </b-card-header>
    <b-card-body>
      <!-- POST CONTENT -->
      <div v-if="content" class="card--post post-content">
        <!-- <text-editor :content="content" :editable="false" /> -->
        <span v-html="reverseContent"></span>
      </div>

      <!-- POST ATTACHES -->
      <div class="card--post post-attaches">
        <div v-if="isSingle" class="post-attaches--single">
          <div v-if="file.images.length" class="post-attaches--single-image">
            <b-img-lazy
              v-bind="{
                center:true,fluidGrow: true,
                blank: true,
                blankColor: '#bbb'
              }"
              :src="file.images[0].lazy_thumbnail_url"
              :alt="file.images[0].name"
              fluid
              class="w-100"
            ></b-img-lazy>
          </div>
          <div v-if="file.videos.length" class="post-attaches--single-video">
            <div class="video-area">
              <video
                width="100%"
                height="auto"
                controls
                :poster="file.videos[0].lazy_thumbnail_url"
              >
                <source :src="file.videos[0].raw" :type="file.videos[0].mimetype" />
              </video>
            </div>
          </div>

          <div v-if="file.audios.length" class="post-attaches--single-audio">
            <!-- AUDIO -->
            <div class="w-100">
              <audio width="100%" height="auto" controls>
                <source :src="file.audios[0].raw" :type="file.audios[0].mimetype" />
              </audio>
            </div>
          </div>

          <div v-if="file.others.length" class="post-attaches--single-file">
            <!-- ORTHER -->
            <div class="w-100">
              <file-item :instance="file.others[0]" :selected="false" />
            </div>
          </div>
        </div>
        <div v-else class="post-attaches--multip">
          <div
            v-if="imagevideos.length"
            class="post-attaches--multip-same-layout"
            :id="'post-attaches--multip-same-layout_'+id"
          >
            <b-tooltip
              :target="'post-attaches--multip-same-layout_'+id"
              title="Tooltip title"
              triggers="hover"
            >
              <strong>Shift</strong> + Mouse scroll
            </b-tooltip>
            <transition-group name="flip-list" tag="div" class="scrolling-wrapper mt-2">
              <figure class="img-wrapper" v-for="(item,i) in imagevideos" :key="item.id" :id="i">
                <div class="top-left">
                  <div class="text-white">
                    <b-avatar :size="24" href="#foobar" variant="primary">
                      <fa-icon :icon="['fas',fileType(item)]" />
                    </b-avatar>
                  </div>
                </div>
                <div class="img-wrapper-fill">
                  <b-img class="img-wrapper-fill-image" :src="item.lazy_thumbnail_url"></b-img>
                </div>
              </figure>
            </transition-group>
          </div>
        </div>

        <!-- POST LINK -->
        <div v-if="linkAttachment" class="post-link-share-wrapper">
          <link-item
            :link="linkAttachment.link"
            :picture="linkAttachment.picture"
            :title="linkAttachment.title"
            :description="linkAttachment.description"
            :name="linkAttachment.name"
          />
        </div>
      </div>

      <!-- POST SOCIAL -->
      <div v-if="showBottom" class="card--post post-social">
        <div class="post-social-buttons" v-if="$auth.loggedIn">
          <reaction-button :my_reaction="my_reaction" type="post" :object_id="id" />

          <b-button
            variant="light"
            size="sm"
            @click="showComment = true"
            class="post-social-buttons-same"
          >
            <fa-icon :icon="['far','comment']" class="post-social-buttons-same-icon" />
          </b-button>

          <b-button variant="light" size="sm" class="post-social-buttons-same">
            <fa-icon :icon="['far','paper-plane']" class="post-social-buttons-same-icon" />
          </b-button>
        </div>
        <div class="post-social-details">
          <div class="post-social-details-item">
            <reaction-icon :reactions_count="summary.reactions_count" :my_reaction="my_reaction" />
          </div>
          <div class="post-social-details-item">
            <span style="font-size: 20px;">&middot;</span>
          </div>
          <div class="post-social-details-item" v-if="summary.comments_count != 0">
            <b-button variant="link">
              <span v-html="summary.comments_count + ' Bình luận'"></span>
            </b-button>
          </div>
        </div>
      </div>

      <!-- POST COMMENT -->
      <div class="card--post post-comment border-top" v-if="showComment">
        <comment-list
          v-show="showComment"
          :form="true"
          :object_id="id"
          content_type="post"
          :focus="focusCommentId"
          :parent="null"
          type="comment"
        />
      </div>

      <div class="post-extra border-top">
        <slot name="post-extra"></slot>
      </div>
    </b-card-body>
  </b-card>
</template>

<style lang="scss">
$post-space: 1.25rem;

.page {
  .card--post {
    // &.create-post {
    //   .scrolling-wrapper {
    //     .img-wrapper {
    //       height: 10rem !important;
    //       width: 7rem !important;
    //     }
    //   }
    // }
    .card-body {
      padding: 0;

      .post-content,
      .post-social,
      .post-comment,
      .post-buttons {
        padding-right: $post-space;
        padding-left: $post-space;
        padding-top: $post-space / 2;
        padding-bottom: $post-space / 2;
      }

      .post-link-share-wrapper {
        position: relative;
        .post-link-share {
          text-decoration: none;

          &--picture {
            img {
              width: 100%;
            }
          }
          &--detail {
            background-color: #f3f6f8;
            padding-right: $post-space / 2;
            padding-left: $post-space / 2;
          }
        }
        &--float-tr {
          position: absolute;
          top: 16px;
          right: 16px;
        }
      }
      .post-attaches {
        &--single {
          &-audio,
          &-file {
            padding-right: $post-space;
            padding-left: $post-space;
          }
        }
        &--multip {
          padding-right: $post-space;
          padding-left: $post-space;
        }
      }
      .post-social {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap-reverse;
        align-items: center;

        &-buttons {
          &-same {
            background-color: transparent;
            border: 0;
            outline: 0;
            &-icon {
              width: 20px;
              height: 20px;
            }
            &:active {
              background-color: #f8f9fa !important;
              border-color: #f8f9fa !important;
            }
            &:active,
            &:focus {
              outline: 0;
              border: 0;
              box-shadow: none;
            }
          }
        }

        &-details {
          &-item {
            display: inline-block;
            span,
            label,
            button {
              font-size: 13px;
              color: #606770;
              vertical-align: top;
              margin-bottom: 0;
            }
          }
        }
      }

      .reaction-icon {
        transition: 0.2s;
        cursor: pointer;
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        .no-reaction,
        img {
          width: 22px;
          height: 22px;
        }
        &.reaction-icon-65 {
          .no-reaction,
          img {
            width: 14px;
            height: 14px;
          }
        }
        &.reaction-icon-75 {
          .no-reaction,
          img {
            width: 16px;
            height: 16px;
          }
        }
        &.reaction-icon-85 {
          .no-reaction,
          img {
            width: 18px;
            height: 18px;
          }
        }
        &.reaction-icon-145 {
          .no-reaction,
          img {
            width: 34px;
            height: 34px;
          }
        }
      }
      .brl--active {
        color: #007bff !important;
      }

      .scrolling-wrapper {
        max-width: 100%;
        width: 100%;
        overflow: auto;
        white-space: nowrap;

        .img-wrapper {
          height: 20rem;
          width: auto;
          transition: all 1s;
          display: inline-block;
          border-radius: 18px;
          margin-left: 4px;
          position: relative;
          overflow: hidden;

          &-fill {
            width: 100%;
            height: 100%;
            justify-content: center;
            display: flex;
            flex-direction: row;
            overflow: hidden;
            &-image {
              flex: 1;
              height: 100%;
            }
          }

          .top-left,
          .top-right {
            position: absolute;
            top: 0;
            margin: 0.25rem;
          }
          .top-left {
            left: 0;
          }
          .top-right {
            right: 0;
          }
        }
      }
    }
  }
}
</style>
