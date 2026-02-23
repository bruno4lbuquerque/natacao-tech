import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'
import type { NivelDTO } from '@/core/types/api'

export const useLevelsStore = defineStore('levels', () => {
  const levels = ref<NivelDTO[]>([])
  const loading = ref(false)

  async function fetchLevels() {
    loading.value = true
    try {
      const response = await api.get<NivelDTO[]>('/api/niveis')
      levels.value = response.data
    } catch (error) {
      console.error('Erro ao buscar níveis:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    levels,
    loading,
    fetchLevels,
  }
})
