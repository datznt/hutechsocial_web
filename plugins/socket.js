import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'

export default function ({ store }) {
    Vue.use(VueNativeSock, 'ws://localhost:8000', {
        store : store,
        format: 'json',
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        connectManually: true,
    })
}