
export default {
  mode: 'universal',
  modern: true,
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
      { hid: 'image', name: 'image', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', type: 'text/css', href: '/css/style.css' },
      { rel: 'stylesheet', type: 'text/css', href: 'https://cdn.jsdelivr.net/npm/@voerro/vue-tagsinput@2.2.0/dist/style.css' },
      { rel: 'stylesheet', type: 'text/css', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css' },
    ],
    // script: [
    //   { src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/js/all.min.js' },
    // ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#000' },
  /*
  ** Global CSS
  */
  css: [
    // './node_modules/bootstrap/dist/css/bootstrap.css',
    '@/assets/scss/custom_bootstrap.scss',
    'assets/main.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/axios-port.js',
    '~/plugins/combined-inject.js',
    '~/plugins/lodash.js',
    '~/plugins/sanitize.js',
    { src: '~/plugins/socket.js', mode: 'client', ssr: false },
    { src: '~/plugins/vuejs-plugins.js', ssr: false },
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    ['@nuxtjs/fontawesome', {
      component: 'fa',
      suffix: true,
      icons: {
        solid: true,
        regular: true
      }
    }]
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/onesignal',
    '@nuxtjs/pwa',
    ['vue-scrollto/nuxt', { duration: 300 }],
  ],
  // https://a8ed199a.ngrok.io
  axios: {
    // baseURL: 'http://127.0.0.1:8000/api',
    baseURL: 'http://127.0.0.1:8000/api',
  },

  typescript: {
    typeCheck: {
      eslint: true
    }
  },

  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: 'auth/login/', method: 'post', propertyName: 'key' },
          user: { url: 'users/session-user/?expand=avatar,setting', method: 'get', propertyName: 'user' },
          logout: { url: 'auth/logout/', method: 'post' },
        },
        tokenType: "Token"
      },
      watchLoggedIn: true,
    },
    plugins: ['~/plugins/auth.js'],
    redirect: {
      login: '/login',
      logout: '/login',
      callback: '/login',
      home: '/'
    },
    rewriteRedirects: true
  },

  fontawesome: {
    component: 'fa',
    suffix: true,
  },

  // Options
  oneSignal: {
    init: {
      appId: 'b5c7fd82-e7bd-48a2-9984-2232a1265969',
      allowLocalhostAsSecureOrigin: true,
      welcomeNotification: {
        disable: true
      },
      // notifyButton: {
      //   enable: true,
      // },
      autoRegister: true,
    }
  },

  router: {
    middleware: ['auth']
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    },
    // transpile: ['vue-notifications']
  }
}