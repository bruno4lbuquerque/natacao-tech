<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import Button from 'primevue/button'
import Sidebar from 'primevue/sidebar'

const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50 relative font-sans">
    <aside
      class="hidden md:block fixed inset-y-0 left-0 z-20 w-64 h-screen overflow-hidden bg-white shadow-sm border-r border-slate-200"
    >
      <AppSidebar />
    </aside>

    <Sidebar
      v-model:visible="mobileMenuOpen"
      class="w-64 md:hidden p-0 border-none"
    >
      <AppSidebar @click="mobileMenuOpen = false" />
    </Sidebar>

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
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-sidebar) {
  padding: 0 !important;
  background-color: #ffffff !important;
  border: none;
}
:deep(.p-sidebar-content) {
  padding: 0 !important;
  height: 100%;
}
:deep(.p-sidebar-header) {
  display: none !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
