import Vue from 'vue'

import ReadMore from 'vue-read-more';
Vue.use(ReadMore);

import InfiniteLoading from 'vue-infinite-loading';
Vue.use(InfiniteLoading, { /* options */ });

import VoerroTagsInput from '@voerro/vue-tagsinput';
Vue.component('tags-input', VoerroTagsInput);

import Sticky from 'vue-sticky-directive'
Vue.use(Sticky)

import {
    ValidationObserver,
    ValidationProvider,
    extend,
    localize
} from "vee-validate";
import vi from "vee-validate/dist/locale/vi.json";
import * as rules from "vee-validate/dist/rules";
// Install VeeValidate rules and localization
Object.keys(rules).forEach(rule => {
    extend(rule, rules[rule]);
});
localize("vi", vi);
Vue.component("ValidationObserver", ValidationObserver);
Vue.component("ValidationProvider", ValidationProvider);

import { VueMasonryPlugin } from 'vue-masonry';
Vue.use(VueMasonryPlugin)

import VueScrollTo from 'vue-scrollto';
// You can also pass in the default options
Vue.use(VueScrollTo, {
    container: "body",
    duration: 500,
    easing: "ease",
    offset: 0,
    force: true,
    cancelable: true,
    onStart: false,
    onDone: false,
    onCancel: false,
    x: false,
    y: true
})

import VueTimeago from 'vue-timeago'
 
Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'en', // Default locale
})