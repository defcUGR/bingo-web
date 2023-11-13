import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Notifications from '@kyvg/vue3-notification'

import './index.css'

const app = createApp(App)

app.use(createPinia()).use(router).use(Notifications)

app.mount('#app')
