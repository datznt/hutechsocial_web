<script>
import client from "@/services/client";
import _ from "lodash";
export default {
  validate({ params }) {
    return /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(params.slug);
  },
  async asyncData({ params, error }) {
    try {
      const { data } = await client.user("retrieve", {
        slug: params.slug
      });
      return {
        instance: data
      };
    } catch (err) {
      error({
        statusCode: 404,
        message: "Trang này không tồn tại!"
      });
    }
  },
  data: () => ({
    instance: null
  }),
  computed: {
    reverseBanner() {
      const lazy = _.get(this.instance, "banner.lazy_thumbnail_url", null);
      if (lazy) {
        return lazy;
      }
      return "/images/banner.png";
    },
    reverseAvatar() {
      const lazy = _.get(this.instance, "avatar.lazy_thumbnail_url", null);
      if (lazy) {
        return lazy;
      }
      return "/images/avatar-anonymous.png";
    }
  }
};
</script>
<template>
  <b-row class="page-user-profile">
    <b-col>
      <div class="w-100">
        <b-card class="gedf-card" no-body>
          <b-card-header header-tag="div" class="p-0 border-0 bg-light overflow-hidden">
            <div class="banner-transition" :style="{maxHeight: '10rem'}">
              <b-img
                fluid
                :src="reverseBanner"
                alt="Transparent image"
                blank-color="#88f"
                class="w-100"
              ></b-img>
            </div>
          </b-card-header>
          <b-card-body>
            <div class="d-flex justify-content-between align-items-center">
              <div class="clearfix">
                <div class="d-flex justify-content-between position-relative">
                  <div class="position-absolute" style="top:-2rem;">
                    <b-avatar
                      :src="reverseAvatar"
                      variant="light"
                      size="8rem"
                      class="border avatar--logo shadow-sm"
                    ></b-avatar>
                  </div>
                  <div style="margin-left:8rem" class="pl-2">
                    <h4>{{instance.full_name}}</h4>
                    <!-- <span class="text-muted">{{instance.industry.name}} &#8226; {{reverseSlogan}}</span> -->
                  </div>
                </div>
                <div class="mt-3">
                  <!-- <b-button variant="primary" size="sm" >
                  <fa-icon :icon="['fas', 'plus']" />&nbsp;Theo dõi
                  </b-button>-->
                  <!-- <b-button
                  variant="outline-info"
                  size="sm"
                  :href="instance.site_url"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Vào trang web&nbsp;
                  <fa-icon :icon="['fas','external-link-alt']" />
                  </b-button>-->
                </div>
              </div>
              <div class="align-self-start">
                <b-dropdown
                  id="dropdown-1"
                  variant="link"
                  right
                  toggle-class="text-secondary"
                  no-caret
                >
                  <template v-slot:button-content>
                    <fa-icon :icon="['fas', 'ellipsis-v']" />
                  </template>
                  <b-dropdown-item>Chia sẻ</b-dropdown-item>
                  <b-dropdown-item>Lấy liên kết</b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
          </b-card-body>
        </b-card>
      </div>
      <b-row>
        <b-col md="8"></b-col>
        <b-col md="4">
          <b-card class="gedf-card">
            <h6>Giới thiệu</h6>
            <p
              class="mb-0"
            >Co-chair of the Bill & Melinda Gates Foundation. Microsoft Co-founder. Voracious reader. Avid traveler. Active blogger.</p>
          </b-card>
          <b-card class="gedf-card">
            <h6>Học vấn</h6>
            <ul class="list-unstyled m-0">
              <li class="pl-2 border-primary mb-1" style="border-left: 2px solid">
                <div class="education-item">
                  <span class>Trường tiểu học Hưng Tây</span>
                  <br />
                  <small>1998 - 2000</small>
                </div>
              </li>
              <li class="pl-2 border-primary mb-1" style="border-left: 2px solid">
                <div class="education-item">
                  <span class>Trung học phổ thông Thái Lão</span>
                  <br />
                  <small>1998 - 2000</small>
                </div>
              </li>
              <li class="pl-2 border-primary mb-1" style="border-left: 2px solid">
                <div class="education-item">
                  <span class>Đại học Thành Phố Hồ Chí Minh Hutech</span>
                  <br />
                  <small>1998 - 2000</small>
                </div>
              </li>
            </ul>
          </b-card>
          <b-card class="gedf-card">
            <h6>Kinh nghiệm</h6>
            <ul class="list-unstyled m-0">
              <li>
                <div class="education-item d-flex justify-content-start">
                  <div
                    class="time-line--point"
                    style="
                            position: relative;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        "
                  >
                    <div
                      class
                      style="
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            z-index: 0;
                        "
                    >
                      <span
                        class="border-primary h-100"
                        style="width: 2px; border-left: 2px solid;"
                      ></span>
                    </div>
                    <span
                      style="
                            z-index: 999;
                            background: #fff;
                        "
                    ><small>1998</small></span>
                  </div>
                  <div class="time-line--content p-2">
                    <h6 class="mb-0">IT devoloper</h6>
                    <small>NEC - Việt Nam</small>
                  </div>
                </div>
              </li>
              <li>
                <div class="education-item d-flex justify-content-start">
                  <div
                    class="time-line--point"
                    style="
                            position: relative;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        "
                  >
                    <div
                      class
                      style="
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            z-index: 0;
                        "
                    >
                      <span
                        class="border-primary h-100"
                        style="width: 2px; border-left: 2px solid;"
                      ></span>
                    </div>
                    <span
                      style="
                            z-index: 999;
                            background: #fff;
                        "
                    ><small>2000</small></span>
                  </div>
                  <div class="time-line--content p-2">
                    <h6 class="mb-0">IT devoloper</h6>
                    <small>NEC - Việt Nam</small>
                  </div>
                </div>
              </li>
              <li>
                <div class="education-item d-flex justify-content-start">
                  <div
                    class="time-line--point"
                    style="
                            position: relative;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        "
                  >
                    <div
                      class
                      style="
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            z-index: 0;
                        "
                    >
                      <span
                        class="border-primary h-100"
                        style="width: 2px; border-left: 2px solid;"
                      ></span>
                    </div>
                    <span
                      style="
                            z-index: 999;
                            background: #fff;
                        "
                    ><small>2004</small></span>
                  </div>
                  <div class="time-line--content p-2">
                    <h6 class="mb-0">IT devoloper</h6>
                    <small>NEC - Việt Nam</small>
                  </div>
                </div>
              </li>
              
              <!-- <li class="mb-1">
                <div class="company-item d-flex justify-content-start">
                  <b-avatar>
                    <fa-icon :icon="['fas','building']" />
                  </b-avatar>
                  <div class="company-information ml-2">
                    <h6 class="mb-0">IT devoloper</h6>
                    <span class>NEC - Viet Nam</span>
                    <br />
                  </div>
                </div>
              </li>
              <li class="mb-1">
                <div class="company-item d-flex justify-content-start">
                  <b-avatar>
                    <fa-icon :icon="['fas','building']" />
                  </b-avatar>
                  <div class="company-information ml-2">
                    <h6 class="mb-0">IT devoloper</h6>
                    <span class>NEC - Viet Nam</span>
                    <br />
                  </div>
                </div>
              </li>
              <li class="mb-1">
                <div class="company-item d-flex justify-content-start">
                  <b-avatar>
                    <fa-icon :icon="['fas','building']" />
                  </b-avatar>
                  <div class="company-information ml-2">
                    <h6 class="mb-0">IT devoloper</h6>
                    <span class>NEC - Viet Nam</span>
                    <br />
                  </div>
                </div>
              </li>-->
            </ul>
          </b-card>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>