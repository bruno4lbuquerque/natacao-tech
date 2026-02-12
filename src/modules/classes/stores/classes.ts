import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'
import type { TurmaDTO } from '@/core/types/api'

export const useClassesStore = defineStore('classes', () => {
  const classes = ref<TurmaDTO[]>([])
  const loading = ref(false)

  async function fetchClasses() {
    loading.value = true
    try {
      const response = await api.get('/api/turmas')
      classes.value = response.data
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
    } finally {
      loading.value = false
    }
  }

  return { classes, loading, fetchClasses }
})
