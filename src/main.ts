import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Notifications from '@kyvg/vue3-notification'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

import './index.css'

const app = createApp(App)

app.use(createPinia()).use(router).use(Notifications).use(autoAnimatePlugin)

app.mount('#app')
