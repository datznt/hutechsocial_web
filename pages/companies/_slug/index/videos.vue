<script>
import client from "@/services/client";
import { InstagramLoader } from "vue-content-loader";
import ListEmpty from "@/components/ListEmpty";
import _ from "lodash";
export default {
  components: { InstagramLoader, ListEmpty },
  props: ["instance", "role"],
  async asyncData({ params }) {
    const { data } = await client.company(
      "Get the entire video post attached to this company",
      {
        slug: params.slug
      }
    );
    var recent = null;
    if (data.results.length) {
      recent = data.results[0];
      _.remove(data.results, vd => vd.id == recent.id);
    }
    return {
      video: {
        recent: recent,
        next: data.next,
        results: data.results
      }
    };
  },
  data: () => ({
    video: {
      recent: null,
      next: "",
      results: []
    }
  }),
  created() {
    //   {
    //     "id": "6eb6e06c-351b-47b0-bec1-c217d25759d7",
    //     "lazy_thumbnail_url": null,
    //     "create_at": "2020-04-29T14:02:36.278531Z",
    //     "mimetype": "video/mp4",
    //     "raw": "http://127.0.0.1:8000/media/4feda7e4-8b07-4120-8333-325e773f1f09/6eb6e06c-351b-47b0-bec1-c217d25759d7/Explore_the_Hidden_Worlds_of_the_National_Parks.mp4",
    //     "attach_posts": [
    //         {
    //         "id": "be1062d7-e08f-42f0-b9dc-f67efafe1330",
    //         "post": {
    //             "content": "<p>Google’s mission is to organize the world‘s information and make it universally accessible and useful. Since our founding in 1998, Google has grown by leaps and bounds. From offering search in a single language we now offer dozens of products and services—including various forms of advertising and web applications for all kinds of tasks—in scores of languages. And starting from two computer science students in a university dorm room, we now have thousands of employees and offices around the world. A lot has changed since the first Google search engine appeared. But some things haven’t changed: our dedication to our users and our belief in the possibilities of the Internet itself.</p>"
    //              "create_at" : "2020-04-29T14:02:36.278531Z"
    //         }
    //         }
    //     ]
    // }
  },
  methods: {
    getVideoContent(data) {
      return _.get(data, "attach_posts[0].post.content", null);
    },
    async infiniteHandler($state) {
      if (!this.video.next) {
        $state.complete();
        return;
      }
      try {
        const { data } = await client.company(
          "Get the entire video post attached to this company",
          {
            slug: this.instance.slug,
            url: this.video.next
          }
        );
        if (data.results.length) {
          this.video.recent = data.results[0];
          _.remove(data.results, vd => vd.id == this.video.recent.id);
          Object.assign(this.video, {
            next: data.next,
            results: [...this.video.results, ...data.results]
          });
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        console.error(err);
      }
    },
    reversePostLink(data) {
      const postId = _.get(data, "attach_posts[0].post.id", null);
      if (!postId) {
        return null;
      }
      return "/posts/" + postId;
    }
  }
};
</script>
<template>
  <div class="company-company-videos-wrapper w-100" v-if="instance">
    <b-card v-if="!video.recent" no-body class="gedf-card">
      <b-card-body>
        <list-empty></list-empty>
      </b-card-body>
    </b-card>

    <div class="recent-video" v-if="video.recent">
      <b-card class="gedf-card card--recent-video" title="Video mới nhất" no-body>
        <b-card-header header-tag="div" class="p-0 border-0 bg-light">
          <div class="video-area">
            <video
              width="100%"
              height="auto"
              controls
              :poster="video.recent.lazy_thumbnail_url"
              autoplay
              muted
            >
              <source :src="video.recent.raw" :type="video.recent.mimetype" />
            </video>
          </div>
        </b-card-header>
        <b-card-body>
          <div class="video-content">
            <div class="video-content-text">
              <p v-html="getVideoContent(video.recent)"></p>
            </div>
            <div class="video-content-btns">
              <b-button
                variant="outline-primary"
                :href="reversePostLink(video.recent)"
                rel="noopener noreferrer"
                target="_blank"
              >
                XEM BÀI VIẾT&nbsp;
                <fa-icon :icon="['fas','external-link-alt']" />
              </b-button>
            </div>
          </div>
        </b-card-body>
      </b-card>
    </div>
    <div class="all-videos">
      <b-card-group columns>
        <b-card
          class="gedf-card card--recent-video"
          no-body
          v-for="(item,i) in video.results"
          :key="i"
        >
          <b-card-header header-tag="div" class="p-0 border-0 bg-light">
            <div class="video-area">
              <video width="100%" height="auto" controls :poster="item.lazy_thumbnail_url">
                <source :src="item.raw" :type="item.mimetype" />
              </video>
            </div>
          </b-card-header>
          <b-card-body>
            <div class="video-content">
              <!-- <div class="video-content-text">
                <p v-html="getVideoContent(item)" style="max-height:5rem; overflow:hidden"></p>
              </div>-->
              <div class="video-content-btns">
                <b-button
                  variant="primary"
                  :href="reversePostLink(item)"
                  rel="noopener noreferrer"
                  target="_blank"
                  size="sm"
                >Xem bài viết</b-button>
              </div>
            </div>
          </b-card-body>
        </b-card>
      </b-card-group>
      <infinite-loading @infinite="infiniteHandler">
        <div slot="spinner">
          <b-card no-body class="gedf-card">
            <b-card-body>
              <instagram-loader :speed="2"></instagram-loader>
            </b-card-body>
          </b-card>
        </div>
        <div slot="no-results"> <div class="d-none"></div> </div>
      </infinite-loading>
    </div>
  </div>
</template>
<style lang="scss" scoped>
</style>