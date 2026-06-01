<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/core/stores/auth'
import Toast from 'primevue/toast'

const toast = useToast()
const router = useRouter()
const auth = useAuthStore()

const handleApiError = (e: Event) => {
  const msg = (e as CustomEvent).detail
  toast.add({
    severity: 'error',
    summary: 'Acesso Negado',
    detail: msg,
    life: 5000,
  })
}

const handleVisibilityChange = () => {
  if (document.visibilityState !== 'visible') return
  auth.checkAuth()
  if (!auth.isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
    router.push('/login')
  }
}

onMounted(() => {
  window.addEventListener('api-error', handleApiError)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('api-error', handleApiError)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <Toast />
  <router-view />
</template>
