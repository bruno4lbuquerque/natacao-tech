<script setup lang="ts">
import { ref, watch, onErrorCaptured } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const mobileMenuOpen = ref(false)
const route = useRoute()

const hasRouteError = ref(false)

watch(() => route.fullPath, () => {
  hasRouteError.value = false
})

onErrorCaptured((err, _instance, info) => {
  console.error('[Layout] erro capturado em rota', info, err)
  hasRouteError.value = true
  return false
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 relative font-sans">
    <aside
      class="hidden md:block fixed inset-y-0 left-0 z-20 w-64 h-screen overflow-hidden bg-white shadow-sm border-r border-slate-200"
    >
      <AppSidebar />
    </aside>

    <Drawer
      v-model:visible="mobileMenuOpen"
      :showCloseIcon="false"
      class="w-64 !p-0"
      style="background: #fff; border: none"
    >
      <AppSidebar @click="mobileMenuOpen = false" />
    </Drawer>

    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64"
    >
      <header
        class="md:hidden bg-white h-16 shadow-sm flex items-center justify-between px-4 sticky top-0 z-10 border-b border-slate-100"
      >
        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-bars"
            text
            rounded
            severity="secondary"
            @click="mobileMenuOpen = true"
          />
          <span class="font-bold text-lg text-slate-800 tracking-tight"
            >AcquOn</span
          >
        </div>
        <div
          class="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-100"
        >
          A
        </div>
      </header>

      <main class="p-4 md:p-8 w-full max-w-7xl mx-auto">
        <div
          v-if="hasRouteError"
          class="flex flex-col items-center justify-center py-24 text-center"
        >
          <i class="pi pi-exclamation-circle text-5xl text-red-400 mb-4"></i>
          <p class="text-slate-600 text-lg font-medium mb-2">Erro ao carregar a página</p>
          <p class="text-slate-400 text-sm mb-6">Verifique o console ou tente novamente.</p>
          <button
            class="px-5 py-2 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
            @click="hasRouteError = false"
          >
            Tentar novamente
          </button>
        </div>

        <router-view v-else v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-drawer-content) {
  padding: 0 !important;
  height: 100%;
}
:deep(.p-drawer-header) {
  display: none !important;
}

/* leave instantâneo: evita flash branco entre rotas com mode="out-in" */
.fade-leave-active {
  transition: none;
}
.fade-enter-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter-from {
  opacity: 0;
}
</style>
