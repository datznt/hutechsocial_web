import VueSanitize from "vue-sanitize";
import Vue from 'vue';
const defaultOptions = {
    allowedTags: ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'p', 'span'],
    allowedAttributes: {
        'a': ['href']
    }
};
Vue.use(VueSanitize, defaultOptions);