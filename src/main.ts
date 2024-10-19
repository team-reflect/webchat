import './assets/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueShowdownPlugin from 'vue-showdown'

const app = createApp(App)

app.use(VueShowdownPlugin, {
  options: {
    emoji: true,
  },
})

app.mount('#app')
