<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const mobileMenuOpen = ref(false)
const route = useRoute()
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
        <router-view v-slot="{ Component }">
          <transition name="fade">
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
