// import Vue from 'vue'
// import VueNativeSock from 'vue-native-websocket';

// export default function ({ store, $auth }) {
//     let _url = 'ws://127.0.0.1:8000/';
//     // if ($auth) {
//     //     _url += `?Authorization=${$auth.getToken("local")}`;
//     // }
//     Vue.use(VueNativeSock, _url, {
//         connectManually: true,
//         store,
//         reconnection: true,
//         // reconnectionAttempts: 5,
//         reconnectionDelay: 3000,
//         format: "json",
//     })
// }