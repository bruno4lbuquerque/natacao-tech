import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import router from './router'
import { ptBR } from './core/config/primevueLocale'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('tooltip', Tooltip)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
  locale: ptBR,
})

app.use(ToastService)
app.use(ConfirmationService)

app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Error]', info, err)
}

app.mount('#app')
